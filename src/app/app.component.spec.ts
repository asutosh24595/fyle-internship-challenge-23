import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { Observable, of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getUser',
      'getRepositories',
    ]);
    apiServiceSpy.getRepositories.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    });

    component = TestBed.createComponent(AppComponent).componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should call getUser method of ApiService on search', () => {
    const username = 'testUser';
    const userData = { avatar_url: 'avatar.jpg', name: 'Test User' };
    apiService.getUser.and.returnValue(of(userData));

    component.username = username;
    component.onSearch();

    expect(apiService.getUser).toHaveBeenCalledWith(username);
    expect(component.loadingData).toBe(false);
    expect(component.img).toEqual(userData.avatar_url);
    expect(component.fullname).toEqual(userData.name);
  });

  it('should handle error from getUser method of ApiService', () => {
    const username = 'testUser';
    const errorMessage = 'User not found';

    apiService.getUser.and.returnValue(
      new Observable((observer) => {
        observer.error(errorMessage);
      })
    );

    component.username = username;
    component.onSearch();

    expect(apiService.getUser).toHaveBeenCalledWith(username);
    expect(component.userNotFound).toBe(true);
  });

  it('should fetch repositories for selected page on pagination', fakeAsync(() => {
    const username = 'testUser';
    const userData = {
      avatar_url: 'avatar.jpg',
      name: 'Test User',
      public_repos: 15,
    };
    const reposPerPage = 5;
    const totalPages = Math.ceil(userData.public_repos / reposPerPage);
    const selectedPage = 2;

    apiService.getUser.and.returnValue(of(userData));

    component.username = username;
    component.onSearch();
    tick();

    expect(component.loadingData).toBe(false);

    const reposForSelectedPage = Array.from(
      { length: reposPerPage },
      (_, index) => ({
        name: `Repo ${selectedPage * reposPerPage + index + 1}`,
      })
    );
    apiService.getRepositories.and.returnValue(of(reposForSelectedPage));

    component.onPageChange(selectedPage);
    tick();

    expect(component.loadingRepos).toBe(false);
    expect(component.repos).toEqual(reposForSelectedPage);
  }));

  it('should fetch repositories for selected page on page change', fakeAsync(() => {
    const username = 'testUser';
    const reposPerPage = 5;
    const selectedPage = 2;

    const reposForSelectedPage = Array.from(
      { length: reposPerPage },
      (_, index) => ({
        name: `Repo ${selectedPage * reposPerPage + index + 1}`,
      })
    );
    apiService.getRepositories.and.returnValue(of(reposForSelectedPage));

    component.username = username;
    component.onPageChange(selectedPage);
    tick();

    expect(component.loadingRepos).toBe(false);

    expect(component.repos).toEqual(reposForSelectedPage);
  }));

  it('should calculate total pages based on total repositories and repositories per page', () => {
    const totalRepos = 20;
    const reposPerPage = 10;

    const totalPages = component.calculateTotalPages(totalRepos);

    expect(totalPages).toEqual(2);
  });

  it('should set loadingRepos to true before making the API call', () => {
    apiService.getRepositories.and.returnValue(of([]));

    component.getRepos();

    expect(component.loadingRepos).toBe(false);
  });

  it('should set loadingRepos to false after receiving the response from the API call', fakeAsync(() => {
    const reposData = [{ id: 1, name: 'Repo 1' }];
    apiService.getRepositories.and.returnValue(of(reposData));
    component.getRepos();
    tick();

    expect(component.loadingRepos).toBe(false);
  }));

  it('should correctly set the repos array with the data received from the API call', fakeAsync(() => {
    const reposData = [{ id: 1, name: 'Repo 1' }];
    apiService.getRepositories.and.returnValue(of(reposData));

    component.getRepos();
    tick();
    expect(component.repos).toEqual(reposData);
  }));

  it('should handle error from getRepos method of ApiService', () => {
    const errorMessage = 'Error fetching repositories';

    apiService.getRepositories.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    component.getRepos();

    expect(apiService.getRepositories).toHaveBeenCalled();
    expect(component.loadingRepos).toBe(false);
  });

  it('should update the currentPage property with the selected page number', () => {
    const selectedPage = 2;
    component.onPageChange(selectedPage);
    expect(component.currentPage).toEqual(selectedPage);
  });

  it('should call getRepos method after updating the currentPage', () => {
    spyOn(component, 'getRepos');

    const selectedPage = 2;
    component.onPageChange(selectedPage);

    expect(component.getRepos).toHaveBeenCalled();
  });

  it('should return an array of page numbers from 1 to totalPages', () => {
    const totalPages = 5;
    component.totalPages = totalPages;
    const pageNumbers = component.getPageNumbers();
    expect(pageNumbers.length).toBe(totalPages);
    for (let i = 0; i < totalPages; i++) {
      expect(pageNumbers[i]).toBe(i + 1);
    }
  });

  it('should reset the currentPage to 1 when page size is changed', () => {
    component.currentPage = 3;
    component.onPageSizeChange();
    expect(component.currentPage).toBe(1);
  });

  it('should recalculate the totalPages based on the new page size', () => {
    const initialTotalRepos = 10;
    component.totalRepos = initialTotalRepos;
    const newPageSize = 20;

    component.onPageSizeChange();
    expect(component.totalPages).toBe(
      Math.ceil(initialTotalRepos / newPageSize)
    );
  });

  it('should call getRepos method after resetting the currentPage and recalculating totalPages', () => {
    spyOn(component, 'getRepos');

    component.onPageSizeChange();
    expect(component.getRepos).toHaveBeenCalled();
  });
});
