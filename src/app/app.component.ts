import { Component } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private apiService: ApiService) {}

  didSearch: boolean = false;
  username: string = '';
  userNotFound: boolean = false;
  img = '';
  fullname = '';
  bio = '';
  location = '';
  twitterLink = '';
  blog = '';
  company = '';
  github = '';
  repos: any[] = [];
  paginatedRepos: any[] = [];
  pageSize: number = 10;
  currentPage: number = 1;
  totalRepos: number = 0;
  totalPages: number = 0;
  loadingData: boolean = false;
  loadingRepos: boolean = false;

  onSearch() {
    if (this.username) {
      this.didSearch = true;
      this.userNotFound = false;
      this.loadingData = true;
      this.repos = [];
      this.currentPage = 1;
      console.log('Loading Data: ', this.loadingData);
      this.apiService.getUser(this.username).subscribe({
        next: (data: any) => {
          console.log(data);
          this.loadingData = false;
          console.log('Loading Data: ', this.loadingData);
          this.img = data.avatar_url;
          this.fullname = data.name;
          this.bio = data.bio;
          this.location = data.location;
          this.twitterLink = `https://twitter.com/${data.twitter_username}`;
          this.blog = data.blog;
          this.company = data.company;
          this.github = data.html_url;
          this.totalRepos = data.public_repos;
          this.calculateTotalPages(this.totalRepos);
          this.getRepos();
        },

        error: (err: any) => {
          this.userNotFound = true;
        },
      });
    }
  }

  calculateTotalPages(totalRepos: number) {
    this.totalPages = Math.ceil(totalRepos / this.pageSize);
    return this.totalPages;
  }

  getRepos() {
    this.loadingRepos = true;
    this.apiService
      .getRepositories(this.username, this.currentPage, this.pageSize)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.loadingRepos = false;
          this.repos = data;
          console.log('length: ', data.length);
          console.log('pageSize: ', this.pageSize);
          console.log('currentPage: ', this.currentPage);
        },
        error: (error: any) => {
          console.error('Error getting repositories: ', error);
          this.loadingRepos = false;
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getRepos();
  }

  getPageNumbers(): number[] {
    const pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalRepos / this.pageSize);
    this.getRepos();
  }
}
