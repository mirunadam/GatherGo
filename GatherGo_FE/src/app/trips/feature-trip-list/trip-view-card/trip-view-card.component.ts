import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TripDto} from "../../domain/trip.dto";
import {DatePipe, LowerCasePipe, NgClass, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";

@Component({
  selector: 'app-trip-view-card',
  templateUrl: './trip-view-card.component.html',
  styleUrls: ['./trip-view-card.component.scss'],
  imports: [
    DatePipe,
    MatIconModule,
    NgIf,
    MatCardModule,
    NgClass,
    LowerCasePipe,
    MatButtonModule,
    MatMenuModule
  ],
  standalone: true
})
export class TripViewCardComponent {
    @Input() trip: TripDto | undefined = undefined;
    @Input() address: string | undefined = undefined;

    @Output() onEditClick = new EventEmitter<string | undefined>();

    imageError = false;

  onImgLoadError() {
    this.imageError = true;
  }
}
