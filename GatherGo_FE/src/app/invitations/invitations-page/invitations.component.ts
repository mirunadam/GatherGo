import { Component } from '@angular/core';
import { InvitationSendCardComponent } from './invitation-send-card/invitation-send-card.component';
import { InvitationsReceivedCardComponent } from './invitations-received-card/invitations-received-card.component';
import {SentInvitationsCardComponent} from "./sent-invitations-card/sent-invitations-card.component";

@Component({
  selector: 'app-invitations',
  standalone: true,
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  imports: [
    InvitationSendCardComponent,
    InvitationsReceivedCardComponent,
    SentInvitationsCardComponent
  ]
})
export class InvitationsComponent {}

