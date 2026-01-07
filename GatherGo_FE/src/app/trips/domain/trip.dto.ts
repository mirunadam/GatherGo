import {PointDtoModel} from "../../shared-domain/point-dto.model";
import {CurrencyCode} from "../../shared-domain/currency-code-enum";

export interface TripDto {
  uuid: string,
  ownerEmail: string | null | undefined,
  location: PointDtoModel | null | undefined;
  dateStart: Date | null | undefined;
  dateEnd: Date | null | undefined;
  budget: number | null | undefined,
  currency: CurrencyCode | null | undefined;
  maxPeople: number | null | undefined;
  itinerary: string | null | undefined;
  accommodation: string | null | undefined;
  imageURL: string | null | undefined;
  isPublic: boolean;
}
