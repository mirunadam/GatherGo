import {PointDtoModel} from "../../shared-domain/point-dto.model";
import {CurrencyCode} from "../../shared-domain/currency-code-enum";

export interface TripDto {
  uuid: string,
  location: PointDtoModel | null | undefined;
  dateStart: Date | null | undefined;
  dateEnd: Date | null | undefined;
  budget: number | null | undefined,
  currency: CurrencyCode | null | undefined;
  maxPeople: number | null | undefined;
}
