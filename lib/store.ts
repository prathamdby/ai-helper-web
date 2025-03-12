import { create } from "zustand";

interface Settings {
  geminiKey: string;
  openrouterKey: string;
  selectedModels: string[];
}

interface ModelResponse {
  name: string;
  status: string;
  timeTaken?: number;
}

interface AppState {
  settings: Settings;
  modelResponses: ModelResponse[];
  isSettingsConfigured: boolean;
  setSettings: (settings: Settings) => void;
  setModelResponses: (modelResponses: ModelResponse[]) => void;
  checkSettings: () => void;
}

const useStore = create<AppState>((set) => ({
  settings: {
    geminiKey: "",
    openrouterKey: "",
    selectedModels: [],
  },
  modelResponses: [],
  isSettingsConfigured: false,
  setSettings: (settings) =>
    set((state) => {
      const isSettingsConfigured = !!(
        settings.geminiKey &&
        settings.openrouterKey &&
        settings.selectedModels.length > 0
      );
      return { settings, isSettingsConfigured };
    }),
  setModelResponses: (modelResponses) => set({ modelResponses }),
  checkSettings: () =>
    set((state) => {
      const isSettingsConfigured = !!(
        state.settings.geminiKey &&
        state.settings.openrouterKey &&
        state.settings.selectedModels.length > 0
      );
      return { isSettingsConfigured };
    }),
}));

export default useStore;
