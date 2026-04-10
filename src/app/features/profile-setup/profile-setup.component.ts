import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.scss']
})
export class ProfileSetupComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    age: [null as number | null, [Validators.required, Validators.min(1), Validators.max(120)]],
    gender: ['', Validators.required]
  });

  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      await this.profileService.saveProfile({
        name: this.form.value.name!,
        age: this.form.value.age!,
        gender: this.form.value.gender!
      });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Failed to save profile. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
