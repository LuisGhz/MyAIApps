import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-enhance-icon',
  templateUrl: './enhance-icon.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class EnhanceIcon {}
