import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type ContainerType = 'Can' | 'Bottle' | '2-Liter' | 'Cup';

export const OZ_MAP: Record<ContainerType, number> = {
  Can: 12,
  Bottle: 20,
  '2-Liter': 67.6,
  Cup: 16
};

export interface DrinkLog {
  id: string;
  user_id: string;
  type: ContainerType;
  quantity: number;
  logged_at: string;
  created_at: string;
}

export interface NewDrinkLog {
  type: ContainerType;
  quantity: number;
  logged_at: string;
}

@Injectable({ providedIn: 'root' })
export class DrinkLogService {
  private sb = this.supabase.client;

  logs = signal<DrinkLog[]>([]);
  loading = signal(false);

  todayLogs = computed(() => {
    const today = new Date().toDateString();
    return this.logs().filter(l => new Date(l.logged_at).toDateString() === today);
  });

  todayCount = computed(() =>
    this.todayLogs().reduce((sum, l) => sum + l.quantity, 0)
  );

  todayOz = computed(() =>
    this.todayLogs().reduce((sum, l) => sum + l.quantity * OZ_MAP[l.type], 0)
  );

  allTimeCount = computed(() =>
    this.logs().reduce((sum, l) => sum + l.quantity, 0)
  );

  constructor(private supabase: SupabaseService) {}

  async loadLogs() {
    this.loading.set(true);
    try {
      const { data, error } = await this.sb
        .from('drink_logs')
        .select('*')
        .order('logged_at', { ascending: false });
      if (error) throw error;
      this.logs.set(data as DrinkLog[]);
    } finally {
      this.loading.set(false);
    }
  }

  async addLog(entry: NewDrinkLog) {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.sb
      .from('drink_logs')
      .insert({ ...entry, user_id: user.id })
      .select()
      .single();
    if (error) throw error;

    // Optimistically prepend
    this.logs.update(prev => [data as DrinkLog, ...prev]);
  }

  async updateLog(id: string, changes: { type: ContainerType; quantity: number }) {
    const { data, error } = await this.sb
      .from('drink_logs')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Optimistically update in place
    this.logs.update(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
  }

  async deleteLog(id: string) {
    const { error } = await this.sb
      .from('drink_logs')
      .delete()
      .eq('id', id);
    if (error) throw error;

    // Optimistically remove
    this.logs.update(prev => prev.filter(l => l.id !== id));
  }

  ozFor(log: DrinkLog): number {
    return log.quantity * OZ_MAP[log.type];
  }

  groupByDay(): { date: string; logs: DrinkLog[]; totalOz: number }[] {
    const map = new Map<string, DrinkLog[]>();
    for (const log of this.logs()) {
      const d = new Date(log.logged_at).toDateString();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(log);
    }
    return Array.from(map.entries()).map(([date, logs]) => ({
      date,
      logs,
      totalOz: logs.reduce((sum, l) => sum + this.ozFor(l), 0)
    }));
  }
}
