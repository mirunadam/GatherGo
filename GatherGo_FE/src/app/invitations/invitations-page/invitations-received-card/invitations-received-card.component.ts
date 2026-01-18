import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { InviteDto } from '../../domain/invite.dto';
import { InviteStatus } from '../../domain/invite-status';
import { InviteService } from '../../services/invite.service';
import { LoggedInContextService } from '../../../services/logged-in-context.service';

@Component({
  selector: 'app-invitations-received-card',
  standalone: true,
  templateUrl: './invitations-received-card.component.html',
  styleUrls: ['./invitations-received-card.component.scss'],
  imports: [
    NgForOf,
    NgIf,
    MatButtonModule
  ]
})
export class InvitationsReceivedCardComponent implements OnInit {

  receivedInvites: InviteDto[] = [];
  userEmail: string | undefined;

  protected readonly InviteStatus = InviteStatus;

  constructor(
    private inviteService: InviteService,
    private loggedInContext: LoggedInContextService
  ) {}

  ngOnInit() {
    this.loggedInContext.getUserData().subscribe(user => {
      this.userEmail = user.email;

      if (this.userEmail) {
        this.inviteService
          .getAllInvitesByReceiverEmail(this.userEmail)
          .subscribe(invites => {
            this.receivedInvites = invites;
          });
      }
    });
  }

  accept(invite: InviteDto) {
    invite.status = InviteStatus.ACCEPTED;
    this.inviteService.createInvite(invite).subscribe();
  }

  reject(invite: InviteDto) {
    invite.status = InviteStatus.REJECTED;
    this.inviteService.createInvite(invite).subscribe();
  }
}
