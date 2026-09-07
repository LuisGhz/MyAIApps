import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { select } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { ModelsApi } from '../../services';
import { ModelListItemResModel } from '../../models';

@Component({
  selector: 'app-models-home-page',
  imports: [NzTableModule, NzButtonModule, NzIconModule, NzModalModule],
  templateUrl: './models-home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelsHomePage {
  readonly #router = inject(Router);
  readonly #modelsApi = inject(ModelsApi);
  readonly #modal = inject(NzModalService);
  readonly #message = inject(NzMessageService);

  readonly isMobile = select(AppStore.isMobile);
  readonly models = resource({
    loader: () => this.#modelsApi.fetchAll(),
    defaultValue: [],
  });

  onAdd(): void {
    this.#router.navigate(['/admin/models/new']);
  }

  onEdit(model: ModelListItemResModel): void {
    this.#router.navigate(['/admin/models', model.id]);
  }

  onDelete(model: ModelListItemResModel): void {
    this.#modal.confirm({
      nzTitle: 'Delete Model',
      nzContent: `Are you sure you want to delete "${model.name}"?`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await this.#modelsApi.deleteModel(model.id);
          this.models.reload();
          this.#message.success('Model deleted successfully');
        } catch (error) {
          // Error handled by interceptor
        }
      },
    });
  }
}
