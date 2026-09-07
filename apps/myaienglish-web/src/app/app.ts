import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Sider } from '@core/components/sider/sider';
import { dispatch, select } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { AppActions } from '@st/app/app.actions';
import { Header } from '@core/components/header/header';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzLayoutModule, Sider, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #authService = inject(AuthService);
  readonly #collapse = dispatch(AppActions.CollapseMenu);
  readonly #expand = dispatch(AppActions.ExpandMenu);
  readonly #updateIsMobile = dispatch(AppActions.UpdateIsMobile);
  readonly #mobileQuery = '(max-width: 991px)';
  readonly isCollapsed = select(AppStore.isMenuCollapsed);
  readonly isAuthenticated = toSignal(this.#authService.isAuthenticated$, { initialValue: false });
  readonly isMobile = select(AppStore.isMobile);
  readonly collapsedWidth = computed(() => (this.isMobile() ? 0 : 84));
  readonly expandedWidth = signal(220);

  ngOnInit(): void {
    this.#breakpointObserver.observe(this.#mobileQuery).subscribe((result) => {
      if (result.matches) {
        this.#updateIsMobile(true);
        this.#collapse();
      } else {
        this.#updateIsMobile(false);
        this.#expand();
      }
    });

    this.#refreshTokenOnLoad();
  }

  collapseFromBackdrop(): void {
    this.#collapse();
  }

  #refreshTokenOnLoad(): void {
    this.#authService.isAuthenticated$.pipe(
      take(1),
      filter((isAuth) => isAuth),
      switchMap(() => this.#authService.getAccessTokenSilently()),
      catchError(() => {
        this.#authService.logout({ logoutParams: { returnTo: window.location.origin } });
        return EMPTY;
      }),
    ).subscribe();
  }
}
