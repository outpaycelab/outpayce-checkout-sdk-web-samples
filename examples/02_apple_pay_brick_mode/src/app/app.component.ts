import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardFormComponent } from './card-form/card-form.component';
import { ApplepayComponent } from './applepay/applepay.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardFormComponent, ApplepayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  ppid!: string;
  constructor(private http: HttpClient) {
  }
  
  async getPPID() {
    this.http.get('/api/ppid').subscribe((data: any) => {
      console.log(data);
      this.ppid = data.ppid;
    });
  }
}
