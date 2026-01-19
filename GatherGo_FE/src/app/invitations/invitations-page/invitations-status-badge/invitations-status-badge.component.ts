import {Component, Input, OnInit} from '@angular/core';
import {InviteStatus} from "../../domain/invite-status";
import {NgIf} from "@angular/common";

const STATUS_MAP = {
  'PENDING': {
    'mainColor': 'oklch(.554 .135 66.442)',
    'backgroundColor': 'oklch(.973 .071 103.193)'
  },
  'ACCEPTED': {
    'mainColor': 'oklch(.527 .154 150.069)',
    'backgroundColor': 'oklch(.962 .044 156.743)'
  },
  'REJECTED': {
    'mainColor': 'oklch(.505 .213 27.518)',
    'backgroundColor': 'oklch(.936 .032 17.717)'
  },
  'CANCELLED': {
    'mainColor': 'oklch(.505 .213 27.518)',
    'backgroundColor': 'oklch(.936 .032 17.717)'
  }
}

@Component({
  selector: 'app-invitations-status-badge',
  standalone: true,
  templateUrl: './invitations-status-badge.component.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./invitations-status-badge.component.scss']
})
export class InvitationsStatusBadgeComponent implements OnInit{
  @Input() status: InviteStatus | undefined | null = undefined;
  mainColor: string = '';
  backgroundColor: string = '';

  ngOnInit() {
    if(this.status) {
      this.mainColor = STATUS_MAP[this.status].mainColor;
      this.backgroundColor = STATUS_MAP[this.status].backgroundColor;
    }
  }
}
