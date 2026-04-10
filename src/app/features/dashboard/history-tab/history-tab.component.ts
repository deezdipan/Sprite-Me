import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DrinkLogService, DrinkLog, OZ_MAP } from '../../../core/services/drink-log.service';

@Component({
  selector: 'app-history-tab',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.scss']
})
export class HistoryTabComponent {
  deleting = new Set<string>();

  constructor(public drinkLog: DrinkLogService) {}

  groupedLogs() {
    return this.drinkLog.groupByDay();
  }

  ozFor(log: DrinkLog): number {
    return log.quantity * (OZ_MAP[log.type] ?? 0);
  }

  containerEmoji(type: string): string {
    const map: Record<string, string> = {
      Can: '🥫', Bottle: '🍶', '2-Liter': '🧃', Cup: '🥤'
    };
    return map[type] ?? '🥤';
  }

  async delete(id: string) {
    this.deleting.add(id);
    try {
      await this.drinkLog.deleteLog(id);
    } finally {
      this.deleting.delete(id);
    }
  }
}
