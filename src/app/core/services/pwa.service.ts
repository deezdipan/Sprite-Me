import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private installPrompt: any = null;

  // true  = already installed / running standalone
  // false = installable (prompt available)
  // null  = not installable on this browser (e.g. iOS Safari without prompt API)
  isInstalled = signal<boolean>(this.checkStandalone());
  canInstall  = signal<boolean>(false);

  constructor() {
    // Already running as standalone — definitely installed
    if (this.checkStandalone()) {
      this.isInstalled.set(true);
      return;
    }

    // Listen for the browser's install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.installPrompt = e;
      this.canInstall.set(true);
    });

    // Fired after user installs from our prompt
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.canInstall.set(false);
      this.installPrompt = null;
    });
  }

  private checkStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) return false;
    this.installPrompt.prompt();
    const { outcome } = await this.installPrompt.userChoice;
    if (outcome === 'accepted') {
      this.isInstalled.set(true);
      this.canInstall.set(false);
      this.installPrompt = null;
    }
    return outcome === 'accepted';
  }
}
