import {InviteStatus} from "./invite-status";

export class InviteDto {
  uuid: string | undefined = undefined;
  tripId: string | undefined = undefined;
  senderEmail: string | undefined = undefined;
  receiverEmail: string | undefined = undefined;
  status: InviteStatus | undefined = undefined;
  deleted: boolean | undefined = undefined;
}
