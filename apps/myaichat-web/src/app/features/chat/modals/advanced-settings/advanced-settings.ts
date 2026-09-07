import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { dispatch, select } from '@ngxs/store';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { ChatApi } from '@chat/services/chat-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface AdvancedSettingsFormModel {
  maxTokens: FormControl<number>;
  temperature: FormControl<number>;
}

@Component({
  selector: 'app-advanced-settings',
  imports: [NzModalModule, NzInputNumberModule, FormsModule, ReactiveFormsModule],
  templateUrl: './advanced-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSettings implements OnInit {
  isVisible = input.required<boolean>();
  closeModal = output<void>();

  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly #chatApi = inject(ChatApi);
  readonly #ops = select(ChatStore.getOps);
  readonly #currentChatId = select(ChatStore.getCurrentChatId);
  readonly #setOps = dispatch(ChatActions.SetOps);
  readonly maxTokens = computed(() => this.#ops().maxTokens);
  readonly temperature = computed(() => this.#ops().temperature);
  readonly maxTokensErrors = computed(() => this.form.controls.maxTokens.errors);
  readonly temperatureErrors = computed(() => this.form.controls.temperature.errors);
  readonly #minTokens = 100;
  readonly #maxTokens = 8000;
  readonly #minTemperature = 0;
  readonly #maxTemperature = 1;
  debounceDelay = 500;
  maxTokensTimeout: ReturnType<typeof setTimeout> | null = null;
  temperatureTimeout: ReturnType<typeof setTimeout> | null = null;
  form = this.#fb.group<AdvancedSettingsFormModel>({
    maxTokens: this.#fb.nonNullable.control<number>(0, [
      Validators.min(this.#minTokens),
      Validators.max(this.#maxTokens),
    ]),
    temperature: this.#fb.nonNullable.control<number>(0, [
      Validators.min(this.#minTemperature),
      Validators.max(this.#maxTemperature),
    ]),
  });

  constructor() {
    effect(() => {
      if (this.isVisible())
        this.form.patchValue(
          {
            maxTokens: this.maxTokens(),
            temperature: this.temperature(),
          },
          { emitEvent: false },
        );
    });
  }

  ngOnInit(): void {
    this.form.controls.maxTokens.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        if (this.form.controls.maxTokens.invalid) return;
        if (value !== null) this.onMaxTokensChange(value);
      });
    this.form.controls.temperature.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        if (this.form.controls.temperature.invalid) return;
        if (value !== null) this.onTemperatureChange(value);
      });
  }

  onMaxTokensChange(value: number): void {
    this.#setOps({ maxTokens: value });
    const chatId = this.#currentChatId();
    if (this.maxTokensTimeout) clearTimeout(this.maxTokensTimeout);
    this.maxTokensTimeout = setTimeout(() => {
      if (chatId) this.#chatApi.updateMaxTokens(chatId, this.maxTokens());
    }, this.debounceDelay);
  }

  onTemperatureChange(value: number): void {
    this.#setOps({ temperature: value });
    if (this.temperatureTimeout) clearTimeout(this.temperatureTimeout);
    const chatId = this.#currentChatId();
    this.temperatureTimeout = setTimeout(() => {
      if (chatId) this.#chatApi.updateTemperature(chatId, this.temperature());
    }, this.debounceDelay);
  }
}
