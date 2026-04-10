import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeService } from '../../../core/services/badge.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent {
  constructor(public badgeService: BadgeService) {}
}
