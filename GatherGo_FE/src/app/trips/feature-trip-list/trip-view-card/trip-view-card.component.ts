import {Component, Input} from '@angular/core';
import {TripDto} from "../../domain/trip.dto";
import {DatePipe, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-trip-view-card',
  templateUrl: './trip-view-card.component.html',
  styleUrls: ['./trip-view-card.component.scss'],
  imports: [
    DatePipe,
    MatIconModule,
    NgIf
  ],
  standalone: true
})
export class TripViewCardComponent {
    @Input() trip: TripDto | undefined = undefined;
    @Input() address: string | undefined = undefined;
}
