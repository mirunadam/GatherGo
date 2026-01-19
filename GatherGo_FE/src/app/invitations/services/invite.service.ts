import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {InviteDto} from "../domain/invite.dto";

@Injectable({
  providedIn: 'root'
})
export class InviteService {

  url = 'http://localhost:8080/api/invites'

  constructor(private http: HttpClient) { }

  public getAllInvitesByReceiverEmail(email: string) {
    return this.http.get<InviteDto[]>(this.url + `/receiver/${email}`);
  }

  public getAllInvitesBySenderEmail(email: string) {
    return this.http.get<InviteDto[]>(this.url + `/sender/${email}`);
  }

  public createInvite(invite: InviteDto) {
  return this.http.post<InviteDto>(this.url, invite);
  }

  public acceptInvite(inviteId: string) {
  return this.http.patch(`${this.url}/${inviteId}/accept`, {});
}

public rejectInvite(inviteId: string) {
  return this.http.patch(`${this.url}/${inviteId}/reject`, {});
}


}
