import {InviteStatus} from "./invite-status";

export class InviteDto {
  uuid: string | undefined | null = undefined;
  tripId: string | undefined | null = undefined;
  tripName: string | undefined| null = undefined;
  senderEmail: string | undefined | null = undefined;
  receiverEmail: string | undefined | null = undefined;
  status: InviteStatus | undefined | null = undefined;
  deleted: boolean | undefined | null = undefined;
}
