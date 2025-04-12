// register.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    NgForOf
  ],
  standalone: true
})
export class RegisterComponent implements OnInit {
  name: string = '';
  family: string = '';
  families: string[] = [];
  photo: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchFamilies();
  }

  fetchFamilies() {
    this.http.get<string[]>('http://localhost:3000/api/families').subscribe(
      (data) => {
        this.families = data;
      },
      (error) => {
        console.error('Error fetching families:', error);
      }
    );
  }

  createNewFamily() {
    const newFamily = prompt('Enter new family name:');
    if (newFamily) {
      this.family = newFamily;
      this.families.push(newFamily);
    }
  }

  onPhotoChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.photo = event.target.files[0];
    }
  }

  onSubmit() {
    if (!this.name || !this.family || !this.photo) {
      alert('Please complete all fields and upload a photo.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('family', this.family);
    formData.append('photo', this.photo);

    this.http.post('http://localhost:3000/api/register', formData).subscribe(
      (response: any) => {
        if (response.success) {
          localStorage.setItem('user', JSON.stringify({ name: this.name, family: this.family }));
          alert('Registration successful!');
        } else {

          alert('Registration failed: ' + response.message);
        }
      },
      (error) => {
        console.error('API error:', error);
        alert('Registration failed. Please try again later.');
      }
    );
  }

}
