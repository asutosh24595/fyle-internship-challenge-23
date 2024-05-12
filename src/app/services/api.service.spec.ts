import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('should call httpClient.get with the correct URL', inject([HttpTestingController, ApiService],
      (httpMock: HttpTestingController, apiService: ApiService) => {
        const username = 'testuser';
        apiService.getUser(username).subscribe();
        const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
        expect(req.request.method).toEqual('GET');
        httpMock.verify();
      }));
  });

  describe('getRepositories', () => {
    it('should call httpClient.get with the correct URL and parameters', inject([HttpTestingController, ApiService],
      (httpMock: HttpTestingController, apiService: ApiService) => {
        const username = 'testuser';
        const page = 1;
        const perPage = 10;
        apiService.getRepositories(username, page, perPage).subscribe();
        const req = httpMock.expectOne(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`);
        expect(req.request.method).toEqual('GET');
        httpMock.verify();
      }));
  });
});
