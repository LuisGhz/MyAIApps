import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-compare-icon',
  templateUrl: './compare-icon.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class CompareIcon {}
