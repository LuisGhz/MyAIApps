import { UserChatsModel } from '@chat/models/chat.model';

export namespace AppActions {
  const type = '[App]';

  export class ToggleSidebar {
    static readonly type = `${type} Toggle Sidebar`;
  }

  export class CollapseSidebar {
    static readonly type = `${type} Collapse Sidebar`;
  }

  export class UnCollapseSidebar {
    static readonly type = `${type} Uncollapse Sidebar`;
  }

  export class SetIsMobile {
    static readonly type = `${type} Is Mobile`;
    constructor(public payload: boolean) {}
  }

  export class SelectChat {
    static readonly type = `${type} Select Chat`;
    constructor(public payload: string | null) {}
  }

  export class UpdateUserChats {
    static readonly type = `${type} Update User Chats`;
    constructor(public payload: UserChatsModel[]) {}
  }

  export class AddUserChat {
    static readonly type = `${type} Add User Chat`;
    constructor(public payload: UserChatsModel) {}
  }

  export class DeleteChat {
    static readonly type = `${type} Delete Chat`;
    constructor(public payload: string) {}
  }

  export class RenameChat {
    static readonly type = `${type} Rename Chat`;
    constructor(public payload: { chatId: string; newTitle: string }) {}
  }

  export class SetPageTitle {
    static readonly type = `${type} Set Page Title`;
    constructor(public payload: string) {}
  }
}
