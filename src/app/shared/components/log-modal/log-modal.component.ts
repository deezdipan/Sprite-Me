import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DrinkLogService, ContainerType } from '../../../core/services/drink-log.service';

@Component({
  selector: 'app-log-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './log-modal.component.html',
  styleUrls: ['./log-modal.component.scss']
})
export class LogModalComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  containers: ContainerType[] = ['Can', 'Bottle', '2-Liter', 'Cup'];
  containerEmoji: Record<ContainerType, string> = {
    Can: '🥫',
    Bottle: '🍶',
    '2-Liter': '🧃',
    Cup: '🥤'
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LogModalComponent>,
    private drinkLogService: DrinkLogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      type: ['Can', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      isBackdated: [false],
      logged_at: [null]
    });
  }

  get isBackdated() {
    return this.form.get('isBackdated')?.value;
  }

  async save() {
    if (this.form.invalid) return;
    this.saving = true;

    try {
      const { type, quantity, isBackdated, logged_at } = this.form.value;
      const timestamp = isBackdated && logged_at
        ? new Date(logged_at).toISOString()
        : new Date().toISOString();

      await this.drinkLogService.addLog({ type, quantity, logged_at: timestamp });
      this.dialogRef.close('saved');
    } catch (err: any) {
      this.snackBar.open(err.message || 'Failed to log drink', 'Dismiss', { duration: 4000 });
    } finally {
      this.saving = false;
    }
  }
}
