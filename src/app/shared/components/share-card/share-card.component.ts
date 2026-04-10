import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DrinkLogService, OZ_MAP } from '../../../core/services/drink-log.service';
import { ProfileService } from '../../../core/services/profile.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-share-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './share-card.component.html',
  styleUrls: ['./share-card.component.scss']
})
export class ShareCardComponent {
  @ViewChild('cardRef') cardRef!: ElementRef<HTMLDivElement>;

  sharing = false;

  constructor(
    public drinkLog: DrinkLogService,
    public profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {}

  get weekOz(): number {
    const logs = this.drinkLog.logs();
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toDateString();
    });
    return logs
      .filter(l => last7.includes(new Date(l.logged_at).toDateString()))
      .reduce((sum, l) => sum + l.quantity * (OZ_MAP[l.type] ?? 0), 0);
  }

  get weekDrinks(): number {
    const logs = this.drinkLog.logs();
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toDateString();
    });
    return logs
      .filter(l => last7.includes(new Date(l.logged_at).toDateString()))
      .reduce((sum, l) => sum + l.quantity, 0);
  }

  get topContainer(): string {
    const logs = this.drinkLog.logs();
    const counts: Record<string, number> = {};
    for (const log of logs) {
      counts[log.type] = (counts[log.type] ?? 0) + log.quantity;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : 'Can';
  }

  get containerEmoji(): string {
    const map: Record<string, string> = { Can: '🥫', Bottle: '🍶', '2-Liter': '🧃', Cup: '🥤' };
    return map[this.topContainer] ?? '🥤';
  }

  get todayDate(): string {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  async share() {
    this.sharing = true;
    try {
      const canvas = await html2canvas(this.cardRef.nativeElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'sprite-me-stats.png', { type: 'image/png' });

        // Try native share first (mobile)
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My Sprite Stats 🥤' });
        } else {
          // Fallback: download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sprite-me-stats.png';
          a.click();
          URL.revokeObjectURL(url);
          this.snackBar.open('Card downloaded!', '✅', { duration: 3000 });
        }
      }, 'image/png');
    } catch (err: any) {
      this.snackBar.open('Could not generate card', 'Dismiss', { duration: 3000 });
    } finally {
      this.sharing = false;
    }
  }
}
