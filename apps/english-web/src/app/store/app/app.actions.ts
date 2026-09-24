export namespace AppActions {
  const type = (action: string) => `[App] ${action}`;

  export class CollapseMenu {
    static readonly type = type('Collapse Menu');
    constructor() {}
  }

  export class ExpandMenu {
    static readonly type = type('Expand Menu');
    constructor() {}
  }

  export class UpdateIsMobile {
    static readonly type = type('Update Is Mobile');
    constructor(public isMobile: boolean) {}
  }

  export class ToggleMenu {
    static readonly type = type('Toggle Menu');
    constructor() {}
  }
}
