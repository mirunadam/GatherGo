import { Component, OnInit } from '@angular/core';
import { InviteDto } from '../domain/invite.dto';
import { InviteStatus } from '../domain/invite-status';
import { InviteService } from '../services/invite.service';
import { TripService } from '../../trips/services/trip.service';
import { TripDto } from '../../trips/domain/trip.dto';

import { InvitationSendCardComponent } from './invitation-send-card/invitation-send-card.component';
import { InvitationsReceivedCardComponent } from './invitations-received-card/invitations-received-card.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  imports: [
    InvitationSendCardComponent,
    InvitationsReceivedCardComponent
  ]
})
export class InvitationsComponent implements OnInit {

  trips: TripDto[] = [];
  receivedInvites: InviteDto[] = [];

  currentUserEmail = 'test@email.com'; // TODO: replace with auth later

  constructor(
    private inviteService: InviteService,
    private tripService: TripService
  ) {}

  ngOnInit(): void {
    this.loadTrips();
    this.loadReceivedInvites();
  }

  loadTrips() {
    this.tripService.getAllTripsByOwner(this.currentUserEmail)
      .subscribe(trips => {
        this.trips = trips;
      });
  }

  loadReceivedInvites() {
    this.inviteService.getAllInvitesByReceiverEmail(this.currentUserEmail)
      .subscribe(invites => {
        this.receivedInvites = invites.filter(
          i => i.status === InviteStatus.PENDING && !i.deleted
        );
      });
  }

  onInviteSent() {
    // reload after sending invite
    this.loadTrips();
  }

  onInviteHandled() {
    // reload after accept / reject
    this.loadReceivedInvites();
  }
}
