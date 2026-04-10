import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { DrinkLogService } from '../../core/services/drink-log.service';
import { ProfileService } from '../../core/services/profile.service';
import { LogModalComponent } from '../../shared/components/log-modal/log-modal.component';
import { LogTabComponent } from './log-tab/log-tab.component';
import { TodayTabComponent } from './today-tab/today-tab.component';
import { HistoryTabComponent } from './history-tab/history-tab.component';
import { InsightsTabComponent } from './insights-tab/insights-tab.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    LogTabComponent,
    TodayTabComponent,
    HistoryTabComponent,
    InsightsTabComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(
    public auth: AuthService,
    public drinkLog: DrinkLogService,
    public profileService: ProfileService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.drinkLog.loadLogs();
    this.profileService.loadProfile();
  }

  openLogModal() {
    const ref = this.dialog.open(LogModalComponent, {
      width: '420px',
      panelClass: 'sprite-dialog'
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'saved') {
        // logs already updated optimistically in service
      }
    });
  }

  signOut() {
    this.auth.signOut();
  }
}
