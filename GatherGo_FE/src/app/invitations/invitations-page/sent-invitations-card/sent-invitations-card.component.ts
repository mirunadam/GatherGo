import {Component, OnInit} from '@angular/core';
import {InviteDto} from "../../domain/invite.dto";
import {InviteService} from "../../services/invite.service";
import {LoggedInContextService} from "../../../services/logged-in-context.service";
import {NgForOf} from "@angular/common";
import {InvitationsStatusBadgeComponent} from "../invitations-status-badge/invitations-status-badge.component";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-sent-invitations-card',
  standalone: true,
  templateUrl: './sent-invitations-card.component.html',
  imports: [
    NgForOf,
    InvitationsStatusBadgeComponent,
    MatIconModule
  ],
  styleUrls: ['./sent-invitations-card.component.scss']
})
export class SentInvitationsCardComponent implements OnInit {
  invites: InviteDto[] = [];
  senderEmail: string | undefined = undefined;

  constructor(private inviteService: InviteService, private loggedInContext: LoggedInContextService) {
  }

  ngOnInit() {
    this.loggedInContext.getUserData().subscribe(userData => {
      this.senderEmail = userData.email;
      this.getAllInvitesBySender(this.senderEmail);
    })
  }

  private getAllInvitesBySender(email: string | undefined) {
    if(email) {
      this.inviteService.getAllInvitesBySenderEmail(email).subscribe((res) => {
        this.invites = res;
      })
    }
  }

  deleteInvite(invite: InviteDto) {
    invite.deleted = true;

    this.inviteService.updateInvite(invite).subscribe(() => {this.getAllInvitesBySender(this.senderEmail)})
  }
}
