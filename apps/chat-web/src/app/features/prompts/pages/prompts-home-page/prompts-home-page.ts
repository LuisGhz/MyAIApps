import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { PromptsApi } from '@prompts/services';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AppActions } from '@st/app/app.actions';
import { dispatch } from '@ngxs/store';

@Component({
  selector: 'app-prompts-home-page',
  imports: [NzButtonModule, NzIconModule, NzEmptyModule],
  templateUrl: './prompts-home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptsHomePage {
  readonly #router = inject(Router);
  readonly #setPageTitle = dispatch(AppActions.SetPageTitle);
  readonly #promptsApi = inject(PromptsApi);
  readonly prompts = resource({
    loader: () => this.#promptsApi.fetchAll(),
    defaultValue: [],
  });

  ngOnInit(): void {
    this.#setPageTitle('Prompts');
  }

  onSelectPrompt(id: string): void {
    this.#router.navigate(['/prompts', id]);
  }

  onEdit(id: string, event: Event): void {
    event.stopPropagation();
    this.onSelectPrompt(id);
  }

  async onDelete(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.#promptsApi.deletePrompt(id);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  }

  onCreate(): void {
    this.#router.navigate(['/prompts', 'new']);
  }
}
