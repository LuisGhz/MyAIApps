import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '@core/services/auth-api';
import { dispatch, select } from '@ngxs/store';
import { IsAdmin } from '@sh/directives/is-admin';
import { AppStore } from '@st/app/app.store';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface MenuOption {
  icon: string;
  label: string;
  onClick: () => void;
}

@Component({
  selector: 'app-bottom-sider',
  imports: [RouterLink, NzAvatarModule, NzIconModule, IsAdmin],
  templateUrl: './bottom-sider.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class BottomSider {
  readonly #router = inject(Router);
  readonly #elementRef = inject(ElementRef);
  readonly #authApi = inject(AuthApi);
  readonly sidebarCollapsed = select(AppStore.sidebarCollapsed);
  readonly userEmail = select(AuthStore.email);
  readonly userName = select(AuthStore.username);
  readonly #logout = dispatch(AuthActions.Logout);
  readonly isMenuOpen = signal(false);
  readonly firstLetterOfUsername = computed(() => {
    const username = this.userName();
    return username ? username.charAt(0).toUpperCase() : 'U';
  });

  readonly menuOptions = signal<MenuOption[]>([
    {
      icon: 'logout',
      label: 'Logout',
      onClick: () => {
        this.#authApi.logout();
        this.#logout();
        this.#router.navigate(['/auth/login']);
      },
    },
  ]);

  collapseIfMobileAndNotCollapsed = output<void>();

  emitCollapseIfMobileAndNotCollapsed(): void {
    this.collapseIfMobileAndNotCollapsed.emit();
  }

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  onOptionClick(option: MenuOption): void {
    option.onClick();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.#elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }
}
