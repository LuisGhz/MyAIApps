import { ChangeDetectionStrategy, Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-rename-chat-modal',
  imports: [NzModalModule, FormsModule, NzButtonModule, NzInputModule],
  templateUrl: './rename-chat-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameChatModal {
  isVisible = input.required<boolean>();
  chatTitle = input.required<string>();

  saveRename = output<string>();
  cancelRename = output<void>();

  newTitle = signal('');

  constructor() {
    effect(() => {
      this.newTitle.set(this.chatTitle());
    });
  }

  onSave(): void {
    const title = this.newTitle().trim();
    if (title) {
      this.saveRename.emit(title);
    }
  }

  onCancel(): void {
    this.cancelRename.emit();
  }
}
