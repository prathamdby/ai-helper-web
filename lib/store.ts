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
}));

export default useStore;
