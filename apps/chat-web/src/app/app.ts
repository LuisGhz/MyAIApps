import { Component, inject, signal, afterNextRender } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Sider } from './core/components/sider/sider';
import { Header } from './core/components/header/header';
import { dispatch, select } from '@ngxs/store';
import { AuthStore } from '@st/auth/auth.store';
import { AppStore } from '@st/app/app.store';
import { AppActions } from '@st/app/app.actions';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzLayoutModule, Sider, Header],
  templateUrl: './app.html',
})
export class App {
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #collapse = dispatch(AppActions.CollapseSidebar);
  readonly #uncollapse = dispatch(AppActions.UnCollapseSidebar);
  readonly #setIsMobile = dispatch(AppActions.SetIsMobile);
  readonly #mobileQuery = '(max-width: 991px)';
  readonly isSidebarCollapsed = select(AppStore.sidebarCollapsed);
  readonly isAuthenticated = select(AuthStore.isAuthenticated);
  collapsedWidth = signal(60);
  isMobile = signal(false);

  constructor() {
    afterNextRender(() => {
      this.#breakpointObserver.observe([this.#mobileQuery]).subscribe((state) => {
        if (state.matches) {
          this.collapsedWidth.set(0);
          this.#collapse();
          this.#setIsMobile(true);
          this.isMobile.set(true);
        } else {
          this.#uncollapse();
          this.collapsedWidth.set(60);
          this.#setIsMobile(false);
          this.isMobile.set(false);
        }
      });
    });
  }

  closeFromBackdrop(): void {
    this.#collapse();
  }
}
