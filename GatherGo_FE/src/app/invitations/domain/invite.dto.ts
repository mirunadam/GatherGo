import { InviteStatus } from './invite-status';

export class InviteDto {
  uuid!: string;
  tripId!: string;
  senderEmail!: string;
  receiverEmail!: string;
  status: InviteStatus = InviteStatus.PENDING;
  deleted: boolean = false;
}
