import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { InviteService } from "../../services/invite.service";
import { LoggedInContextService } from "../../../services/logged-in-context.service";
import { InviteDto } from "../../domain/invite.dto";
import { InviteStatus } from "../../domain/invite-status";
import { MatButtonModule } from "@angular/material/button";
import { TripService } from "../../../trips/services/trip.service";



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
    private loggedInContext: LoggedInContextService,
    private tripService:TripService
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
    this.inviteService.updateInvite(invite).subscribe(() => {
    if (invite.tripId && invite.receiverEmail) {
      this.tripService.addParticipant(invite.tripId, invite.receiverEmail)
        .subscribe();
    }
  });
  }

  rejectInvite(invite: InviteDto) {
    invite.status = InviteStatus.REJECTED;
    this.inviteService.updateInvite(invite).subscribe();
  }

  protected readonly InviteStatus = InviteStatus;
}
