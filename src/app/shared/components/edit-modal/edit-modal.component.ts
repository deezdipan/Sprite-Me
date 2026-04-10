import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DrinkLogService, DrinkLog, ContainerType } from '../../../core/services/drink-log.service';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatButtonToggleModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss']
})
export class EditModalComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  containers: ContainerType[] = ['Can', 'Bottle', '2-Liter', 'Cup'];
  containerEmoji: Record<ContainerType, string> = {
    Can: '🥫', Bottle: '🍶', '2-Liter': '🧃', Cup: '🥤'
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DrinkLog,
    private drinkLogService: DrinkLogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      type: [this.data.type, Validators.required],
      quantity: [this.data.quantity, [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  async save() {
    if (this.form.invalid) return;
    this.saving = true;
    try {
      await this.drinkLogService.updateLog(this.data.id, {
        type: this.form.value.type,
        quantity: this.form.value.quantity
      });
      this.dialogRef.close('saved');
    } catch (err: any) {
      this.snackBar.open(err.message || 'Failed to update entry', 'Dismiss', { duration: 4000 });
    } finally {
      this.saving = false;
    }
  }
}
