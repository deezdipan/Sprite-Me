import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DrinkLogService, OZ_MAP } from '../../../core/services/drink-log.service';

@Component({
  selector: 'app-today-tab',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, MatIconModule],
  templateUrl: './today-tab.component.html',
  styleUrls: ['./today-tab.component.scss']
})
export class TodayTabComponent {
  todayDate = new Date();

  constructor(public drinkLog: DrinkLogService) {}

  ozFor(type: string, quantity: number): number {
    return (OZ_MAP[type as keyof typeof OZ_MAP] ?? 0) * quantity;
  }

  containerEmoji(type: string): string {
    const map: Record<string, string> = {
      Can: '🥫', Bottle: '🍶', '2-Liter': '🧃', Cup: '🥤'
    };
    return map[type] ?? '🥤';
  }
}
