import { Injectable } from '@angular/core';
import { HttpBaseService } from './http-base.service';

@Injectable({
  providedIn: 'root',
})
export class AuthApi extends HttpBaseService {
  logout() {
    return this.postP('/auth/logout', {});
  }
}
