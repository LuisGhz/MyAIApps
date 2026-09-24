import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { dispatch, select } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { AppActions } from '@st/app/app.actions';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, NzTabsModule],
  templateUrl: './admin-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  readonly #router = inject(Router);
  readonly isMobile = select(AppStore.isMobile);
  readonly #setPageTitle = dispatch(AppActions.SetPageTitle);

  get selectedIndex(): number {
    const url = this.#router.url;
    if (url.includes('/admin/users')) {
      this.#setPageTitle('Users');
      return 1;
    }
    this.#setPageTitle('Models');
    return 0;
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.#router.navigate(['/admin/models']);
    } else if (index === 1) {
      this.#router.navigate(['/admin/users']);
    }
  }
}
