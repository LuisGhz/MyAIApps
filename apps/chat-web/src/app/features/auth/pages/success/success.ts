import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthActions } from '@st/auth/auth.actions';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-success',
  templateUrl: './success.html',
  imports: [NzSpinModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPage {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #store = inject(Store);

  constructor() {
    effect(() => {
      this.#route.queryParams.subscribe((params) => {
        const accessToken = params['accessToken'];
        console.log('Access Token:', accessToken);
        if (accessToken) {
          this.#store.dispatch(new AuthActions.Login({ token: accessToken })).subscribe(() => {
            setTimeout(() => {
              this.#router.navigate(['/']);
            }, 500);
          });
        } else {
          this.#router.navigate(['/auth/login']);
        }
      });
    });
  }
}
