import { DestroyRef, Injectable, Signal, WritableSignal, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeveloperModel } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type PriceFormModel = {
  input: FormControl<number>;
  output: FormControl<number>;
};

export type MetadataFormModel = {
  contextWindow: FormControl<number>;
  maxOutputTokens: FormControl<number>;
  knowledgeCutoff: FormControl<string>;
};

export type ModelFormModel = {
  name: FormControl<string>;
  shortName: FormControl<string>;
  value: FormControl<string>;
  guestAccess: FormControl<boolean>;
  link: FormControl<string>;
  price: FormGroup<PriceFormModel>;
  supportsTemperature: FormControl<boolean>;
  isReasoning: FormControl<boolean>;
  reasoningLevel: FormControl<string | null>;
  metadata: FormGroup<MetadataFormModel>;
  developerId: FormControl<string | null>;
};

@Injectable({ providedIn: 'root' })
export class ModelFormService {
  readonly #fb = inject(FormBuilder);

  createForm(): FormGroup<ModelFormModel> {
    return this.#fb.group({
      name: this.#fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(MODEL_NAME_MAX_LENGTH)],
      }),
      shortName: this.#fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(MODEL_SHORT_NAME_MAX_LENGTH)],
      }),
      value: this.#fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(MODEL_VALUE_MAX_LENGTH)],
      }),
      guestAccess: this.#fb.control(false, {
        nonNullable: true,
      }),
      link: this.#fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      price: this.#fb.group<PriceFormModel>({
        input: this.#fb.control(0, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(PRICE_MIN_VALUE)],
        }),
        output: this.#fb.control(0, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(PRICE_MIN_VALUE)],
        }),
      }),
      supportsTemperature: this.#fb.control(false, {
        nonNullable: true,
      }),
      isReasoning: this.#fb.control(false, {
        nonNullable: true,
      }),
      reasoningLevel: this.#fb.control<string | null>(null, {
        validators: [],
      }),
      metadata: this.#fb.group<MetadataFormModel>({
        contextWindow: this.#fb.control(0, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(TOKENS_MIN_VALUE)],
        }),
        maxOutputTokens: this.#fb.control(0, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(TOKENS_MIN_VALUE)],
        }),
        knowledgeCutoff: this.#fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      }),
      developerId: this.#fb.control<string | null>(null, {
        validators: [Validators.required],
      }),
    }) as FormGroup<ModelFormModel>;
  }

  handleDeveloperChange(
    form: FormGroup<ModelFormModel>,
    developers: Signal<DeveloperModel[]>,
    developerName: WritableSignal<string>,
    destroyRef: DestroyRef,
  ): void {
    form.controls.developerId.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((devId) => {
        const selectedDev = developers().find((dev) => dev.id === devId);
        developerName.set(selectedDev ? selectedDev.name : '');
      });
  }

  handleReasoningLevelControl(form: FormGroup<ModelFormModel>, destroyRef: DestroyRef): void {
    form.controls.isReasoning.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((isReasoning) => {
        const reasoningLevelControl = form.controls.reasoningLevel;
        if (isReasoning) {
          reasoningLevelControl.enable();
          reasoningLevelControl.setValidators([Validators.required]);
        } else {
          reasoningLevelControl.clearValidators();
          reasoningLevelControl.setValue(null);
          reasoningLevelControl.disable();
        }
        reasoningLevelControl.updateValueAndValidity();
      });
  }
}

const MODEL_NAME_MAX_LENGTH = 100;
const MODEL_SHORT_NAME_MAX_LENGTH = 20;
const MODEL_VALUE_MAX_LENGTH = 100;
const PRICE_MIN_VALUE = 0;
const TOKENS_MIN_VALUE = 1;
