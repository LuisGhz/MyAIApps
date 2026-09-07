import { ChangeDetectionStrategy, Component } from '@angular/core';
import { dispatch, select } from '@ngxs/store';
import { AppActions } from '@st/app/app.actions';
import { AppStore } from '@st/app/app.store';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-header',
  imports: [NzIconModule],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly isMenuCollapsed = select(AppStore.isMenuCollapsed);
  readonly #expandMenu = dispatch(AppActions.ExpandMenu);

  onExpandMenu(): void {
    this.#expandMenu();
  }
}
