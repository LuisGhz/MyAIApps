const type = (action: string) => `[App] ${action}`;

class CollapseMenu {
  static readonly type = type('Collapse Menu');
}

class ExpandMenu {
  static readonly type = type('Expand Menu');
}

class UpdateIsMobile {
  static readonly type = type('Update Is Mobile');
  constructor(public isMobile: boolean) {}
}

class ToggleMenu {
  static readonly type = type('Toggle Menu');
}

export const AppActions = {
  CollapseMenu,
  ExpandMenu,
  UpdateIsMobile,
  ToggleMenu,
} as const;
