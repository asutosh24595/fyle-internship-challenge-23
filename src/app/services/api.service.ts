import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  getUser(githubUsername: string): Observable<any> {
    return this.httpClient.get<any>(
      `https://api.github.com/users/${githubUsername}`
    );
  }

  getRepositories(
    githubUsername: string,
    page: number,
    perPage: number
  ): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `https://api.github.com/users/${githubUsername}/repos?page=${page}&per_page=${perPage}`
    );
  }
}
