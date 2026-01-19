import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { InviteDto } from '../../domain/invite.dto';
import { InviteStatus } from '../../domain/invite-status';
import { InviteService } from '../../services/invite.service';
import { TripService } from '../../../trips/services/trip.service';

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
export class InvitationsReceivedCardComponent {

  // ✅ data comes from parent
  @Input() invites: InviteDto[] = [];

  // ✅ notify parent when handled
  @Output() inviteHandled = new EventEmitter<void>();

  constructor(
    private inviteService: InviteService,
    private tripService: TripService
  ) {}

  acceptInvite(invite: InviteDto) {
    if (!invite.tripId || !invite.receiverEmail) {
      return;
    }

    // 1️⃣ add participant to trip
    this.tripService
      .addParticipant(invite.tripId, invite.receiverEmail)
      .subscribe(() => {

        // 2️⃣ mark invite as accepted & deleted
        this.inviteService.acceptInvite(invite.uuid!)
          .subscribe(() => {
            this.inviteHandled.emit();
          });
      });
  }

  rejectInvite(invite: InviteDto) {
    this.inviteService.rejectInvite(invite.uuid!)
      .subscribe(() => {
        this.inviteHandled.emit();
      });
  }

  protected readonly InviteStatus = InviteStatus;
}
