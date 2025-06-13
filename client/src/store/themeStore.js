import { create } from "zustand";

const useThemeStore = create((set) => ({
  selectedTheme: null,
  setTheme: (theme) => set({ selectedTheme: theme }),
}));

export default useThemeStore;