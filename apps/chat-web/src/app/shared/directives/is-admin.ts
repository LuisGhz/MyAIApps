import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { select } from '@ngxs/store';
import { AuthStore } from '@st/auth/auth.store';

@Directive({
  selector: '*[appIsAdmin]',
})
export class IsAdmin {
  #isAdmin = select(AuthStore.isAdmin);
  #template = inject(TemplateRef);
  #viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const isAdmin = this.#isAdmin();
      if (isAdmin) {
        this.#viewContainer.createEmbeddedView(this.#template);
      } else {
        this.#viewContainer.clear();
      }
    });
  }
}
