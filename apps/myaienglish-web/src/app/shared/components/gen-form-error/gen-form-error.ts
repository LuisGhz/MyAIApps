import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-gen-form-error',
  imports: [],
  templateUrl: './gen-form-error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenFormError {
  readonly #cdr = inject(ChangeDetectorRef);
  control = input.required<AbstractControl>();
  key = input<string>();
  keys = input<string[]>();
  message = input<string>();
  messages = input<string[]>();
  id = input<string>();

  constructor() {
    effect(() => {
      const ctrl = this.control();
      const subscription = ctrl.statusChanges.subscribe(() => {
        this.#cdr.markForCheck();
      });

      return () => subscription.unsubscribe();
    });
  }

  get hasError(): boolean {
    const ctrl = this.control();
    const keys = this.keys();
    if (keys && keys.length > 0) return keys.some((key) => ctrl.hasError(key) && ctrl.dirty);

    const key = this.key();
    return key ? ctrl.hasError(key) && ctrl.dirty : false;
  }
}
