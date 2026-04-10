import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DrinkLogService } from '../../../core/services/drink-log.service';
import { ProfileService } from '../../../core/services/profile.service';
import { SupabaseService } from '../../../core/services/supabase.service';

const UNLOCK_THRESHOLD = 5;

@Component({
  selector: 'app-insights-tab',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './insights-tab.component.html',
  styleUrls: ['./insights-tab.component.scss']
})
export class InsightsTabComponent {
  loading = false;
  insight: string | null = null;
  error = '';

  unlockThreshold = UNLOCK_THRESHOLD;

  isUnlocked = computed(() => this.drinkLog.allTimeCount() >= UNLOCK_THRESHOLD);
  drinksUntilUnlock = computed(() =>
    Math.max(0, UNLOCK_THRESHOLD - this.drinkLog.allTimeCount())
  );

  constructor(
    public drinkLog: DrinkLogService,
    public profileService: ProfileService,
    private supabase: SupabaseService
  ) {}

  async generateInsight() {
    this.loading = true;
    this.error = '';
    this.insight = null;

    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const logs = this.drinkLog.logs();
      const profile = this.profileService.profile();

      // Calculate stats to send
      const totalDrinks = this.drinkLog.allTimeCount();
      const todayOz = this.drinkLog.todayOz();
      const allLogs = logs;

      // Daily average oz over last 7 days
      const now = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        return d.toDateString();
      });
      const last7Logs = allLogs.filter(l => last7Days.includes(new Date(l.logged_at).toDateString()));
      const last7Oz = last7Logs.reduce((sum, l) => sum + l.quantity * (({ Can: 12, Bottle: 20, '2-Liter': 67.6, Cup: 16 } as Record<string, number>)[l.type] ?? 0), 0);
      const avgDailyOz = last7Oz / 7;

      const payload = {
        profile: {
          name: profile?.name,
          age: profile?.age,
          gender: profile?.gender
        },
        stats: {
          totalDrinks,
          todayOz: Math.round(todayOz * 10) / 10,
          avgDailyOz: Math.round(avgDailyOz * 10) / 10,
          totalLogs: allLogs.length
        }
      };

      const { data, error } = await this.supabase.client.functions.invoke('generate-insight', {
        body: payload
      });

      if (error) throw error;
      this.insight = data.insight;
    } catch (err: any) {
      this.error = err.message || 'Failed to generate insight. Try again.';
    } finally {
      this.loading = false;
    }
  }
}
