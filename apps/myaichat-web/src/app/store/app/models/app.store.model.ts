import { UserChatsModel } from "@chat/models";

export interface AppStoreModel {
  sidebarCollapsed: boolean;
  selectedChatId: string | null;
  userChats: UserChatsModel[];
  isMobile: boolean;
  pageTitle: string;
}
