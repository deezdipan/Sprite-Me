import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id?: string;
  user_id?: string;
  name: string;
  age: number;
  gender: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private sb = this.supabase.client;
  profile = signal<UserProfile | null>(null);

  constructor(private supabase: SupabaseService) {}

  async loadProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.sb
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      this.profile.set(null);
      return null;
    }

    this.profile.set(data as UserProfile);
    return data as UserProfile;
  }

  async saveProfile(profile: Omit<UserProfile, 'id' | 'user_id'>) {
    const { data: { user } } = await this.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.sb
      .from('user_profiles')
      .upsert({ ...profile, user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    this.profile.set(data as UserProfile);
    return data;
  }
}
