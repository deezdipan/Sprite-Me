import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DrinkLogService } from '../../../core/services/drink-log.service';
import { ShareCardComponent } from '../../../shared/components/share-card/share-card.component';

@Component({
  selector: 'app-log-tab',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, ShareCardComponent],
  templateUrl: './log-tab.component.html',
  styleUrls: ['./log-tab.component.scss']
})
export class LogTabComponent {
  @Output() openModal = new EventEmitter<void>();

  constructor(public drinkLog: DrinkLogService) {}
}
