import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService } from '../../../core/services/badge.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent {
  private prevEarned = 0;

  constructor(public badgeService: BadgeService) {
    effect(() => {
      const current = this.badgeService.earnedCount();

      // Only fire after initial load and when count actually increases
      if (this.prevEarned > 0 && current > this.prevEarned) {
        this.fizzyBurst();
      }

      this.prevEarned = current;
    });
  }

  private fizzyBurst() {
    const colors = ['#1DB954', '#4CD964', '#F5E642', '#ffffff', '#a8ff78'];

    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: ['circle'],
      scalar: 0.9,
      gravity: 0.6,
      drift: 0.5
    });

    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: ['circle'],
      scalar: 0.9,
      gravity: 0.6,
      drift: -0.5
    });

    // Center pop of tiny bubbles
    confetti({
      particleCount: 40,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.6 },
      colors,
      shapes: ['circle'],
      scalar: 0.5,
      gravity: 0.4,
      ticks: 120
    });
  }
}
