import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { TripDto } from '../../../trips/domain/trip.dto';
import { InviteDto } from '../../domain/invite.dto';
import { InviteStatus } from '../../domain/invite-status';
import { InviteService } from '../../services/invite.service';

@Component({
  selector: 'app-invitation-send-card',
  standalone: true,
  templateUrl: './invitation-send-card.component.html',
  styleUrls: ['./invitation-send-card.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule
  ]
})
export class InvitationSendCardComponent {

  // ✅ INPUT from parent
  @Input() trips: TripDto[] = [];

  // ✅ OUTPUT to parent
  @Output() inviteSent = new EventEmitter<void>();

  errorString = '';

  displayTrip = (trip: TripDto | null): string => trip?.name ?? '';

  inviteForm = this.fb.group({
    email: [null as string | null, Validators.required],
    trip: [null as TripDto | null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private inviteService: InviteService
  ) {}

  onSubmit() {
    this.inviteForm.markAllAsTouched();

    if (this.inviteForm.invalid) {
      return;
    }

    const invite = new InviteDto();
    invite.tripId = this.inviteForm.value.trip!.uuid;
    invite.receiverEmail = this.inviteForm.value.email!;
    invite.status = InviteStatus.PENDING;
    invite.deleted = false;

    this.inviteService.createInvite(invite).subscribe({
      next: () => {
        this.inviteForm.reset();
        this.inviteSent.emit(); // 🔥 notify parent
      },
      error: () => {
        this.errorString = 'Something went wrong when sending the invite.';
      }
    });
  }
}
