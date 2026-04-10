import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  loading = false;
  error = '';
  success = '';
  hidePassword = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = '';
    try {
      await this.auth.signUp(
        this.form.value.email!,
        this.form.value.password!
      );
      this.success = 'Account created! Check your email to confirm, then sign in.';
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (err: any) {
      this.error = err.message || 'Sign up failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  get passwordMismatch() {
    return this.form.hasError('passwordMismatch') && this.form.get('confirmPassword')?.touched;
  }
}
