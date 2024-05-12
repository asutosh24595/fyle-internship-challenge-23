import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: { [url: string]: HttpResponse<any> } = {};

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const cachedResponse = this.cache[request.urlWithParams];
    if (cachedResponse) {
      return of(cachedResponse.clone()); // Return a clone of cached response
    } else {
      return next.handle(request).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.cache[request.urlWithParams] = event.clone(); // Store the response in cache
          }
        })
      );
    }
  }
}
