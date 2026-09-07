import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthStoreModel, JwtPayloadModel } from './models';
import { AuthActions } from './auth.actions';

@State<AuthStoreModel>({
  name: 'auth',
  defaults: {
    isAuthenticated: false,
    token: null,
  },
})
@Injectable()
export class AuthStore {
  @Action(AuthActions.Login)
  login(ctx: StateContext<AuthStoreModel>, action: AuthActions.Login) {
    ctx.setState({
      isAuthenticated: true,
      token: action.payload.token,
    });
  }

  @Action(AuthActions.UploadToken)
  uploadToken(ctx: StateContext<AuthStoreModel>, action: AuthActions.UploadToken) {
    ctx.patchState({
      token: action.payload.token,
    });
  }

  @Action(AuthActions.Logout)
  logout(ctx: StateContext<AuthStoreModel>) {
    ctx.setState({
      isAuthenticated: false,
      token: null,
    });
  }

  @Selector()
  static token(state: AuthStoreModel): string | null {
    return state.token;
  }

  @Selector()
  static isAuthenticated(state: AuthStoreModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static userId(state: AuthStoreModel): string | null {
    const decoded = jwtDecode(state.token!) as JwtPayloadModel;
    return decoded.sub;
  }

  @Selector()
  static username(state: AuthStoreModel): string | null {
    const decoded = jwtDecode(state.token!) as JwtPayloadModel;
    return decoded.name;
  }

  @Selector()
  static email(state: AuthStoreModel): string | null {
    const decoded = jwtDecode(state.token!) as JwtPayloadModel;
    return decoded.email;
  }

  @Selector()
  static role(state: AuthStoreModel): string | null {
    const decoded = jwtDecode(state.token!) as JwtPayloadModel;
    return decoded.role;
  }

  @Selector()
  static isAdmin(state: AuthStoreModel): boolean {
    const decoded = jwtDecode(state.token!) as JwtPayloadModel;
    return decoded.role === 'admin';
  }
}
