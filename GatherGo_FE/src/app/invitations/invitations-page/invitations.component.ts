import { Component } from '@angular/core';
import {InvitationSendCardComponent} from "./invitation-send-card/invitation-send-card.component";

@Component({
  selector: 'app-invitations',
  standalone: true,
  templateUrl: './invitations.component.html',
  imports: [
    InvitationSendCardComponent
  ],
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent {}
