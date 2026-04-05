import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  sidebarOpen: boolean;
  activeTab: string;
  theme: "dark" | "light";
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeTab: "dashboard",
      theme: "dark",
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "admin-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }), // only persist theme and sidebar state
    }
  )
);
