import { ChangeDetectionStrategy, Component, signal, ElementRef, inject } from '@angular/core';
import { AdvancedSettings } from '@chat/modals/advanced-settings/advanced-settings';
import { ChatApi } from '@chat/services/chat-api';
import { dispatch, select } from '@ngxs/store';
import { ChatActions } from '@st/chat/chat.actions';
import { ChatStore } from '@st/chat/chat.store';
import { FileStoreService } from '@st/chat/services';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface MenuOption {
  icon: string;
  label: string;
  onClick: () => void;
}

@Component({
  selector: 'app-more-options',
  imports: [NzIconModule, AdvancedSettings],
  templateUrl: './more-options.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class MoreOptions {
  readonly #elementRef = inject(ElementRef);
  readonly #chatApi = inject(ChatApi);
  readonly #fileStoreService = inject(FileStoreService);
  readonly #currentChatId = select(ChatStore.getCurrentChatId);
  readonly #isImageGeneration = select(ChatStore.isImageGeneration);
  readonly #isWebSearch = select(ChatStore.isWebSearch);
  readonly #setOps = dispatch(ChatActions.SetOps);
  readonly #enableImageGeneration = dispatch(ChatActions.EnableImageGeneration);
  readonly #enableWebSearch = dispatch(ChatActions.EnableWebSearch);
  isAdvancedSettingsVisible = signal(false);
  isMenuOpen = signal(false);
  menuOptions = signal<MenuOption[]>([
    {
      icon: 'paper-clip',
      label: 'Agregar fotos y archivos',
      onClick: () => this.handleFileUpload(),
    },
    // TODO: Enable OneDrive integration
    // { icon: 'cloud-upload', label: 'Agregar desde OneDrive', onClick: () => {} },
    { icon: 'picture', label: 'Crea imagen', onClick: () => this.#onToggleImageGeneration() },
    { icon: 'compass', label: 'Busca en la web', onClick: () => this.#onToggleWebSearch() },
    {
      icon: 'setting',
      label: 'Configuración avanzada',
      onClick: () => this.#showAdvancedSettings(),
    },
  ]);
  #fileInput: HTMLInputElement | null = null;

  constructor() {
    this.createFileInput();
  }

  private createFileInput(): void {
    this.#fileInput = document.createElement('input');
    this.#fileInput.type = 'file';
    this.#fileInput.multiple = false;
    this.#fileInput.accept = 'image/png,image/jpeg,image/jpg';
    this.#fileInput.style.display = 'none';
    this.#fileInput.addEventListener('change', (e) => this.#onFileSelected(e));
    document.body.appendChild(this.#fileInput);
  }

  private handleFileUpload(): void {
    this.#fileInput?.click();
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onOptionClick(option: MenuOption): void {
    option.onClick();
    this.closeMenu();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.#elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  #onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileId = this.#fileStoreService.storeFile(file);
      this.#setOps({
        file: {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        },
      });
      input.value = '';
    }
  }

  #onToggleImageGeneration(): void {
    if (this.#isImageGeneration()) return;
    this.#enableImageGeneration();
    if (this.#currentChatId())
      this.#chatApi.updateAIFeatures(this.#currentChatId()!, {
        isImageGeneration: true,
        isWebSearch: false,
      });
  }

  #onToggleWebSearch(): void {
    if (this.#isWebSearch()) return;
    this.#enableWebSearch();
    if (this.#currentChatId())
      this.#chatApi.updateAIFeatures(this.#currentChatId()!, {
        isWebSearch: true,
        isImageGeneration: false,
      });
  }

  #showAdvancedSettings(): void {
    this.isAdvancedSettingsVisible.set(true);
  }

  closeAdvancedSettings(): void {
    this.isAdvancedSettingsVisible.set(false);
  }
}
