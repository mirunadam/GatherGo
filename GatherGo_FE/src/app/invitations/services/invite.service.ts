import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {InviteDto} from "../domain/invite.dto";

@Injectable({
  providedIn: 'root'
})
export class InviteService {

  url = 'http://localhost:8080/api/invite'

  constructor(private http: HttpClient) { }

  public getAllInvitesByReceiverEmail(email: string) {
    return this.http.get<InviteDto[]>(this.url + `/receiver/${email}`);
  }

  public getAllInvitesBySenderEmail(email: string) {
    return this.http.get<InviteDto[]>(this.url + `/sender/${email}`);
  }

  public createInvite(invite: InviteDto) {
    invite.uuid = crypto.randomUUID();

    return this.http.post<InviteDto>(this.url, invite);
  }
}
