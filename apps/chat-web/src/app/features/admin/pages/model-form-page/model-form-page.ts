import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DevelopersApi, ModelFormService, ModelsApi } from '../../services';

@Component({
  selector: 'app-model-form-page',
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzSelectModule],
  templateUrl: './model-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelFormPage {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly #modelsApi = inject(ModelsApi);
  readonly #developersApi = inject(DevelopersApi);
  readonly #message = inject(NzMessageService);
  readonly #modelForm = inject(ModelFormService);

  readonly modelId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly developerName = signal<string>('');

  readonly developers = resource({
    loader: () => this.#developersApi.fetchAll(),
    defaultValue: [],
  });

  readonly form = this.#modelForm.createForm();

  constructor() {
    effect(() => {
      const id = this.#route.snapshot.paramMap.get('id');
      if (id) {
        this.modelId.set(id);
        this.isEditMode.set(true);
        this.#loadModel(id);
      }
    });
  }

  ngOnInit(): void {
    this.#modelForm.handleDeveloperChange(
      this.form,
      this.developers.value,
      this.developerName,
      this.#destroyRef,
    );
    this.#modelForm.handleReasoningLevelControl(this.form, this.#destroyRef);
  }

  async #loadModel(id: string): Promise<void> {
    try {
      const model = await this.#modelsApi.getById(id);
      this.form.patchValue({
        name: model.name,
        shortName: model.shortName,
        value: model.value,
        link: model.link,
        price: {
          input: model.price.input,
          output: model.price.output,
        },
        guestAccess: model.guestAccess,
        supportsTemperature: model.supportsTemperature,
        isReasoning: model.isReasoning,
        reasoningLevel: model.reasoningLevel,
        metadata: {
          contextWindow: model.metadata.contextWindow,
          maxOutputTokens: model.metadata.maxOutputTokens,
          knowledgeCutoff: model.metadata.knowledgeCutoff,
        },
        developerId: model.developer.id,
      });

      this.developerName.set(model.developer.name);
    } catch (error) {
      // Error handled by interceptor
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.form.getRawValue();
      const payload = {
        name: formValue.name,
        shortName: formValue.shortName,
        value: formValue.value,
        link: formValue.link,
        price: formValue.price,
        supportsTemperature: formValue.supportsTemperature,
        isReasoning: formValue.isReasoning,
        reasoningLevel: formValue.reasoningLevel,
        guestAccess: formValue.guestAccess,
        metadata: formValue.metadata,
        developerId: formValue.developerId!,
      };

      if (this.isEditMode()) {
        await this.#modelsApi.update(this.modelId()!, payload);
        this.#message.success('Model updated successfully');
      } else {
        await this.#modelsApi.create(payload);
        this.#message.success('Model created successfully');
      }

      this.#router.navigate(['/admin']);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.#router.navigate(['/admin']);
  }
}
