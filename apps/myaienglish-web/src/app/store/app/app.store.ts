import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AppStoreModel } from './models';
import { Injectable } from '@angular/core';
import { AppActions } from './app.actions';

@State<AppStoreModel>({
  name: 'app',
  defaults: {
    isMenuCollapsed: false,
    isMobile: false,
  },
})
@Injectable()
export class AppStore {
  @Selector()
  static isMenuCollapsed(state: AppStoreModel) {
    return state.isMenuCollapsed;
  }

  @Selector()
  static isMobile(state: AppStoreModel) {
    return state.isMobile;
  }

  @Action(AppActions.CollapseMenu)
  setMenuCollapsed(ctx: StateContext<AppStoreModel>) {
    ctx.patchState({ isMenuCollapsed: true });
  }

  @Action(AppActions.ExpandMenu)
  setMenuExpanded(ctx: StateContext<AppStoreModel>) {
    ctx.patchState({ isMenuCollapsed: false });
  }

  @Action(AppActions.UpdateIsMobile)
  setIsMobile(ctx: StateContext<AppStoreModel>, action: AppActions.UpdateIsMobile) {
    ctx.patchState({ isMobile: action.isMobile });
  }

  @Action(AppActions.ToggleMenu)
  toggleMenu(ctx: StateContext<AppStoreModel>) {
    ctx.patchState({ isMenuCollapsed: !ctx.getState().isMenuCollapsed });
  }
}
