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

@Component({
  selector: 'app-invitation-send-card',
  standalone: true,
  templateUrl: './invitation-send-card.component.html',
  imports: [
    MatInputModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    NgForOf
  ],
  styleUrls: ['./invitation-send-card.component.scss']
})
export class InvitationSendCardComponent implements OnInit{
  tripOptions : TripDto[] = [];
  displayTrip = (trip: TripDto | null): string => trip?.itinerary ?? '';
  senderEmail : string | undefined = undefined;
  errorString: string = '';

  inviteForm = this.fb.group({
    email: [null as string | null, Validators.required],
    tripUuid: [null as string | null, Validators.required]
  });

  constructor(private fb: FormBuilder, private tripService: TripService,
              private loggedInContext: LoggedInContextService, private inviteService: InviteService) {}

  ngOnInit() {
    this.loggedInContext.getUserData().subscribe((userData) => {
      this.senderEmail = userData.email;
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
        tripId: this.inviteForm.value.tripUuid,
        senderEmail: this.senderEmail,
        receiverEmail: this.inviteForm.value.email,
        status: InviteStatus.PENDING,
        deleted: false
      }

      this.inviteService.createInvite(invite).subscribe({
        error: () => {
          this.errorString = 'Something went wrong when sending the invite.'
        }
      });
    }
  }

}
