import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="weather-container" [ngClass]="getTempClass()">
      <h2>Pogoda</h2>
      <div class="search-box">
        <input [(ngModel)]="city" placeholder="Podaj miasto" (keyup.enter)="searchWeather()" />
        <button (click)="searchWeather()">Szukaj</button>
      </div>
      <div *ngIf="weatherData" class="weather-info">
        <h3>{{ weatherData.name }}</h3>
        <p class="temp">Temperatura: {{ weatherData.main.temp }}°C</p>
        <p>Wilgotność: {{ weatherData.main.humidity }}%</p>
        <p>Wiatr: {{ weatherData.wind.speed }} m/s</p>
      </div>
      <div *ngIf="error" class="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .weather-container {
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      margin: 20px auto;
      color: white;
      text-align: center;
      transition: background-color 0.5s;
      background-color: #333;
      font-family: sans-serif;
    }
    .bg-hot { background-color: #ef4444; }
    .bg-warm { background-color: #f97316; }
    .bg-mild { background-color: #22c55e; }
    .bg-cool { background-color: #eab308; }
    .bg-cold { background-color: #3b82f6; } 
    .search-box {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    input {
      padding: 8px;
      border-radius: 4px;
      border: none;
    }
    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      background: white;
      font-weight: bold;
    }
    
    .temp {
        font-size: 2em;
        font-weight: bold;
    }
    
    .error {
        color: #ffcccc;
        margin-top: 10px;
    }
  `]
})
export class App {
  city = '';
  weatherData: any = null;
  error = '';
  private apiKey = 'e34b4c51d8c2b7bf48d5217fe52ff79e';
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }
  searchWeather() {
    if (!this.city) return;


    this.http.get(`${this.apiUrl}?q=${this.city}&appid=${this.apiKey}&units=metric`)
      .subscribe({
        next: (data) => {
          this.weatherData = data;
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.weatherData = null;
          this.error = 'Błąd pobierania danych.';
          console.error(err);
          this.cdr.detectChanges();
        }

      });
  }



  getTempClass() {
    if (!this.weatherData) return '';
    const temp = this.weatherData.main.temp;

    if (temp > 30) return 'bg-hot';
    if (temp >= 20) return 'bg-warm';
    if (temp >= 10) return 'bg-mild';
    if (temp >= 0) return 'bg-cool';
    return 'bg-cold';
  }
}
