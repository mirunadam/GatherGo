import {Component, OnInit} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {TripDto} from "../../../trips/domain/trip.dto";
import {TripService} from "../../../trips/services/trip.service";
import {LoggedInContextService} from "../../../services/logged-in-context.service";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {InviteDto} from "../../domain/invite.dto";
import {InviteStatus} from "../../domain/invite-status";
import {InviteService} from "../../services/invite.service";
import {EmailService} from "../../../services/email.service";

@Component({
  selector: 'app-invitation-send-card',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    NgForOf
  ],
  templateUrl: './invitation-send-card.component.html',
  styleUrls: ['./invitation-send-card.component.scss']
})
export class InvitationSendCardComponent implements OnInit{
  tripOptions : TripDto[] = [];
  displayTrip = (trip: TripDto | null): string => trip?.name ?? '';
  senderEmail : string | undefined = undefined;
  senderName: string | undefined = undefined;
  errorString: string = '';

  inviteForm = this.fb.group({
    email: [null as string | null, Validators.required],
    trip: [null as TripDto | null, Validators.required]
  });

  constructor(private fb: FormBuilder, private tripService: TripService,
              private loggedInContext: LoggedInContextService, private inviteService: InviteService,
              private emailService: EmailService) {}

  ngOnInit() {
    this.loggedInContext.getUserData().subscribe((userData) => {
      this.senderEmail = userData.email;
      this.senderName = userData.username;
      console.log(userData);
      this.tripService.getAllTripsByOwner(userData.email).subscribe((res) => {
        this.tripOptions = res;
      })
    })
  }

  onSubmit() {
    this.inviteForm.markAllAsTouched();

    if(!this.inviteForm.invalid && this.senderEmail) {
      const invite: InviteDto = {
        uuid: undefined,
        tripId: this.inviteForm.value.trip?.uuid,
        tripName: this.inviteForm.value.trip?.name,
        senderEmail: this.senderEmail,
        receiverEmail: this.inviteForm.value.email,
        status: InviteStatus.PENDING,
        deleted: false
      }

      this.inviteService.createInvite(invite).subscribe({
        next: () => {
          const email = this.inviteForm.value.email;
          if(email) {
            this.emailService.sendInvitationEmail({
              sender: this.senderName ?? '',
              tripName: this.inviteForm.value.trip?.name ?? 'Unnamed adventure',
              email: email
            })
          }
        },
        error: () => {
          this.errorString = 'Something went wrong when sending the invite.'
        }
      });
    }
  }

}
