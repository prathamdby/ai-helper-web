import { create } from "zustand";

interface Settings {
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
  ocrText: string;
  question: string;
  isLoading: boolean;
  setSettings: (settings: Settings) => void;
  setModelResponses: (modelResponses: ModelResponse[]) => void;
  setOcrText: (ocrText: string) => void;
  setQuestion: (question: string) => void;
  setLoading: (isLoading: boolean) => void;
}

const useStore = create<AppState>((set) => ({
  settings: {
    openrouterKey: "",
    selectedModels: [],
  },
  modelResponses: [],
  isSettingsConfigured: false,
  ocrText: "",
  question: "",
  isLoading: false,
  setSettings: (settings) =>
    set((state) => {
      const isSettingsConfigured = !!(
        settings.openrouterKey && settings.selectedModels.length > 0
      );
      return { settings, isSettingsConfigured };
    }),
  setModelResponses: (modelResponses) => set({ modelResponses }),
  setOcrText: (ocrText: string) => set({ ocrText }),
  setQuestion: (question: string) => set({ question }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

export default useStore;
