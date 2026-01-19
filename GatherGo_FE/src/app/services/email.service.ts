import { Injectable } from '@angular/core';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() { }

  public sendInvitationEmail(data: {sender: string, tripName: string, email: string}) {
    return emailjs.send('service_o7mhj9q', 'template_4xmg0vx', {...data},
      {
        publicKey: 'iLmWzHc_Sr8Q5SzZC'
      });
  }
}
