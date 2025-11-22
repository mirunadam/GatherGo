import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  template: `
    <h1>Items from Backend</h1>
    <ul>
      <li *ngFor="let item of items">{{ item.name }}</li>
    </ul>
  `
})
export class AppComponent implements OnInit {
  items: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getItems().subscribe(
      data => this.items = data,
      err => console.error(err)
    );
  }
}
