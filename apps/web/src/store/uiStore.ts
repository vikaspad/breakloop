import { create } from "zustand";

interface UIStore {
  showOnboardWizard: boolean;
  wizardStep: number;
  sidebarCollapsed: boolean;
  setWizardStep: (step: number) => void;
  openWizard: () => void;
  closeWizard: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showOnboardWizard: false,
  wizardStep: 0,
  sidebarCollapsed: false,

  setWizardStep: (step) => set({ wizardStep: step }),
  openWizard: () => set({ showOnboardWizard: true, wizardStep: 0 }),
  closeWizard: () => set({ showOnboardWizard: false, wizardStep: 0 }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
