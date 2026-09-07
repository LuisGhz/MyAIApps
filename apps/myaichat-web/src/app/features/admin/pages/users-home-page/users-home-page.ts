import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { select } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { UsersApi } from '../../services';
import { UserModel } from '../../models';

@Component({
  selector: 'app-users-home-page',
  imports: [NzTableModule, NzSelectModule, FormsModule, DatePipe],
  templateUrl: './users-home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersHomePage {
  readonly #usersApi = inject(UsersApi);
  readonly #message = inject(NzMessageService);

  readonly isMobile = select(AppStore.isMobile);
  readonly users = resource({
    loader: () => this.#usersApi.fetchAll(),
    defaultValue: [],
  });
  readonly roles = resource({
    loader: () => this.#usersApi.fetchRoles(),
    defaultValue: [],
  });

  readonly updatingUserId = signal<string | null>(null);

  async onRoleChange(user: UserModel, roleId: string): Promise<void> {
    this.updatingUserId.set(user.id);
    try {
      await this.#usersApi.updateUserRole(user.id, { roleId });
      this.users.reload();
      this.#message.success('User role updated successfully');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      this.updatingUserId.set(null);
    }
  }
}
