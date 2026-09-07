import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AppStoreModel } from './models';
import { AppActions } from './app.actions';
import { UserChatsModel } from '@chat/models/chat.model';

@State<AppStoreModel>({
  name: 'app',
  defaults: {
    sidebarCollapsed: false,
    selectedChatId: null,
    userChats: [],
    isMobile: false,
    pageTitle: 'New Chat',
  },
})
@Injectable()
export class AppStore {
  @Action(AppActions.ToggleSidebar)
  toggleSidebar(ctx: StateContext<AppStoreModel>) {
    const state = ctx.getState();
    ctx.patchState({
      sidebarCollapsed: !state.sidebarCollapsed,
    });
  }

  @Action(AppActions.CollapseSidebar)
  collapseSidebar(ctx: StateContext<AppStoreModel>) {
    ctx.patchState({
      sidebarCollapsed: true,
    });
  }

  @Action(AppActions.UnCollapseSidebar)
  unCollapseSidebar(ctx: StateContext<AppStoreModel>) {
    ctx.patchState({
      sidebarCollapsed: false,
    });
  }

  @Action(AppActions.SetIsMobile)
  setIsMobile(ctx: StateContext<AppStoreModel>, { payload }: AppActions.SetIsMobile) {
    ctx.patchState({
      isMobile: payload,
    });
  }

  @Action(AppActions.SelectChat)
  selectChat(ctx: StateContext<AppStoreModel>, { payload }: AppActions.SelectChat) {
    ctx.patchState({
      selectedChatId: payload,
    });
  }

  @Action(AppActions.UpdateUserChats)
  updateUserChats(ctx: StateContext<AppStoreModel>, { payload }: AppActions.UpdateUserChats) {
    ctx.patchState({
      userChats: payload,
    });
  }

  @Action(AppActions.AddUserChat)
  addUserChat(ctx: StateContext<AppStoreModel>, { payload }: AppActions.AddUserChat) {
    const state = ctx.getState();
    ctx.patchState({
      userChats: [payload, ...state.userChats],
    });
  }

  @Action(AppActions.DeleteChat)
  deleteChat(ctx: StateContext<AppStoreModel>, { payload }: AppActions.DeleteChat) {
    const state = ctx.getState();
    ctx.patchState({
      userChats: state.userChats.filter((chat) => chat.id !== payload),
    });
  }

  @Action(AppActions.RenameChat)
  renameChat(ctx: StateContext<AppStoreModel>, { payload }: AppActions.RenameChat) {
    const state = ctx.getState();
    ctx.patchState({
      userChats: state.userChats.map((chat) =>
        chat.id === payload.chatId ? { ...chat, title: payload.newTitle } : chat,
      ),
    });
  }

  @Action(AppActions.SetPageTitle)
  setPageTitle(ctx: StateContext<AppStoreModel>, { payload }: AppActions.SetPageTitle) {
    ctx.patchState({
      pageTitle: payload,
    });
  }

  @Selector()
  static isMobile(state: AppStoreModel): boolean {
    return state.isMobile;
  }

  @Selector()
  static userChats(state: AppStoreModel): UserChatsModel[] {
    return state.userChats || [];
  }

  @Selector()
  static sidebarCollapsed(state: AppStoreModel): boolean {
    return state.sidebarCollapsed;
  }

  @Selector()
  static selectedChatId(state: AppStoreModel): string | null {
    return state.selectedChatId;
  }

  @Selector()
  static pageTitle(state: AppStoreModel): string {
    return state.pageTitle;
  }
}
