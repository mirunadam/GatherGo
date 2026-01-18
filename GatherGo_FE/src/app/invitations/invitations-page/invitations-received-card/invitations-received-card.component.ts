import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { InviteService } from "../../services/invite.service";
import { LoggedInContextService } from "../../../services/logged-in-context.service";
import { InviteDto } from "../../domain/invite.dto";
import { InviteStatus } from "../../domain/invite-status";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-invitations-received-card',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    MatButtonModule
  ],
  templateUrl: './invitations-received-card.component.html',
  styleUrls: ['./invitations-received-card.component.scss']
})
export class InvitationsReceivedCardComponent implements OnInit {

  invites: InviteDto[] = [];
  userEmail: string | undefined;

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
            this.invites = invites;
          });
      }
    });
  }

  acceptInvite(invite: InviteDto) {
    invite.status = InviteStatus.ACCEPTED;
    this.inviteService.createInvite(invite).subscribe();
  }

  rejectInvite(invite: InviteDto) {
    invite.status = InviteStatus.REJECTED;
    this.inviteService.createInvite(invite).subscribe();
  }

  protected readonly InviteStatus = InviteStatus;
}
