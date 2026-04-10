import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = this.supabase.client;

  currentUser = signal<User | null>(null);
  session = signal<Session | null>(null);

  constructor(private supabase: SupabaseService, private router: Router) {
    // Restore session on init
    this.sb.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.currentUser.set(data.session?.user ?? null);
    });

    // Listen for auth changes
    this.sb.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    await this.sb.auth.signOut();
    this.router.navigate(['/login']);
  }

  async getSession() {
    return this.sb.auth.getSession();
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
