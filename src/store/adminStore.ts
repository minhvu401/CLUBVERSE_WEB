import { create } from "zustand";

interface AdminState {
  sidebarOpen: boolean;
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  sidebarOpen: true,
  activeTab: "dashboard",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
