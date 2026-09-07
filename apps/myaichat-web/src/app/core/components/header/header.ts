import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { dispatch, select } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AppActions } from '@st/app/app.actions';

@Component({
  selector: 'app-header',
  imports: [NzIconModule],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly #title = inject(Title);
  readonly unCollapseSideNav = dispatch(AppActions.UnCollapseSidebar);
  readonly isCollapsed = select(AppStore.sidebarCollapsed);
  readonly isMobile = select(AppStore.isMobile);
  readonly headerTitle = select(AppStore.pageTitle);

  constructor() {
    effect(() => {
      const title = this.headerTitle();
      this.#title.setTitle(title);
    });
  }
}
