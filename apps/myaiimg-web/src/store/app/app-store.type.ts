export type AppStoreType = {
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  collapse: () => void;
  expand: () => void;
  setIsMobile: (isMobile: boolean) => void;
};
