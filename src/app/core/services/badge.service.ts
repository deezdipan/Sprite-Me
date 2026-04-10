import { Injectable, computed } from '@angular/core';
import { DrinkLogService, OZ_MAP } from './drink-log.service';
import { Badge } from '../../shared/models/badge.model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  constructor(private drinkLog: DrinkLogService) {}

  // ─── Helpers ───────────────────────────────────────────────

  private uniqueDays(): string[] {
    const days = new Set(
      this.drinkLog.logs().map(l => new Date(l.logged_at).toDateString())
    );
    return Array.from(days).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  private currentStreak(): number {
    const days = this.uniqueDays();
    if (!days.length) return 0;

    let streak = 1;
    let max = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        max = Math.max(max, streak);
      } else {
        streak = 1;
      }
    }
    return max;
  }

  private allTimeOz(): number {
    return this.drinkLog.logs().reduce(
      (sum, l) => sum + l.quantity * (OZ_MAP[l.type] ?? 0), 0
    );
  }

  private maxDrinksInOneDay(): number {
    const map = new Map<string, number>();
    for (const log of this.drinkLog.logs()) {
      const d = new Date(log.logged_at).toDateString();
      map.set(d, (map.get(d) ?? 0) + log.quantity);
    }
    return Math.max(0, ...Array.from(map.values()));
  }

  // ─── Badges ────────────────────────────────────────────────

  badges = computed<Badge[]>(() => {
    const logs        = this.drinkLog.logs();
    const totalCount  = this.drinkLog.allTimeCount();
    const streak      = this.currentStreak();
    const allOz       = this.allTimeOz();
    const maxOneDay   = this.maxDrinksInOneDay();
    const daysLogged  = this.uniqueDays().length;

    return [
      {
        id: 'first-sprite',
        emoji: '🥫',
        name: 'First Sprite',
        description: 'Log your very first drink',
        earned: totalCount >= 1
      },
      {
        id: 'seven-day-streak',
        emoji: '🔥',
        name: '7-Day Streak',
        description: 'Log at least one drink 7 days in a row',
        earned: streak >= 7
      },
      {
        id: '100-oz-club',
        emoji: '💯',
        name: '100 oz Club',
        description: 'Drink 100+ oz total',
        earned: allOz >= 100
      },
      {
        id: 'fizz-fanatic',
        emoji: '⚡',
        name: 'Fizz Fanatic',
        description: 'Log 5+ drinks in a single day',
        earned: maxOneDay >= 5
      },
      {
        id: '500-oz-legend',
        emoji: '🏆',
        name: 'Sprite Legend',
        description: 'Reach 500 oz total all-time',
        earned: allOz >= 500
      },
      {
        id: 'committed',
        emoji: '📅',
        name: 'Committed',
        description: 'Log drinks on 10 different days',
        earned: daysLogged >= 10
      }
    ];
  });

  earnedBadges  = computed(() => this.badges().filter(b => b.earned));
  lockedBadges  = computed(() => this.badges().filter(b => !b.earned));
  earnedCount   = computed(() => this.earnedBadges().length);
}
