import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { EnhanceApi } from '@enhance/services/enhance-api';
import { EnhanceTextReq } from '@enhance/models/enhance-text-req.model';
import { EnhanceTextRes } from '@enhance/models/enhance-text-res.model';

const COPY_RESET_DELAY_MS = 2000;

const RESULT_FIELDS: ReadonlyArray<{ key: keyof EnhanceTextRes; label: string }> = [
  { key: 'grammarFix', label: 'Grammar Fix' },
  { key: 'informalB2', label: 'Informal B2' },
  { key: 'informalC1', label: 'Informal C1' },
  { key: 'formalB2', label: 'Formal B2' },
  { key: 'formalC1', label: 'Formal C1' },
];

@Component({
  selector: 'app-enhance-page',
  imports: [ReactiveFormsModule, NzInputModule],
  templateUrl: './enhance-page.html',
  styleUrl: './enhance-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnhancePage implements OnDestroy {
  readonly enhanceForm = inject(FormBuilder).nonNullable.group({
    context: [''],
    textToEnhance: ['', Validators.required],
  });

  readonly enhancedText = signal<EnhanceTextRes | null>(null);
  readonly isLoading = signal(false);
  readonly copiedField = signal<keyof EnhanceTextRes | null>(null);
  readonly resultItems = computed(() => {
    const enhancedText = this.enhancedText();

    if (!enhancedText) {
      return [];
    }

    return RESULT_FIELDS.map(({ key, label }) => ({
      key,
      label,
      value: enhancedText[key],
    }));
  });

  onEnhance(): void {
    if (this.enhanceForm.invalid || this.isLoading()) {
      this.enhanceForm.markAllAsTouched();
      return;
    }

    const { context, textToEnhance } = this.enhanceForm.getRawValue();

    const request: EnhanceTextReq = {
      textToEnhance,
      context: context.trim() || undefined,
    };

    this.copiedField.set(null);
    this.isLoading.set(true);

    this.#enhanceApi.enhanceText(request).subscribe({
      next: (response) => {
        if (response) {
          this.enhancedText.set(response);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  copyResult(key: keyof EnhanceTextRes, value: string): void {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    void navigator.clipboard.writeText(value).then(() => {
      this.copiedField.set(key);

      if (this.#copyResetTimer !== null) {
        window.clearTimeout(this.#copyResetTimer);
      }

      this.#copyResetTimer = window.setTimeout(() => {
        this.copiedField.set(null);
        this.#copyResetTimer = null;
      }, COPY_RESET_DELAY_MS);
    });
  }

  ngOnDestroy(): void {
    if (this.#copyResetTimer !== null) {
      window.clearTimeout(this.#copyResetTimer);
    }
  }

  readonly #enhanceApi = inject(EnhanceApi);
  #copyResetTimer: number | null = null;
}
