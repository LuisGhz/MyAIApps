import { create } from "zustand";
import type { AppStoreType } from "@st/app/app-store.type";

export const useAppStore = create<AppStoreType>((set) => ({
  isSidebarCollapsed: false,
  isMobile: false,
  collapse: () => set({ isSidebarCollapsed: true }),
  expand: () => set({ isSidebarCollapsed: false }),
  setIsMobile: (isMobile: boolean) => set({ isMobile }),
}));
