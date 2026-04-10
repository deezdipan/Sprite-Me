import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

export const profileGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const profile = inject(ProfileService);
  const router = inject(Router);

  const { data } = await auth.getSession();
  if (!data.session) {
    router.navigate(['/login']);
    return false;
  }

  const p = await profile.loadProfile();
  if (!p) {
    router.navigate(['/profile-setup']);
    return false;
  }

  return true;
};
