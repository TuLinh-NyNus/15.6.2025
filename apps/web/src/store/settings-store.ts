import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Interface cho notification settings
 */
export interface INotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  newCourses: boolean;
  courseUpdates: boolean;
  examReminders: boolean;
}

/**
 * Interface cho display settings
 */
export interface IDisplaySettings {
  fontSize: "small" | "medium" | "large";
  contrastMode: boolean;
  reduceAnimations: boolean;
  showProgressBar: boolean;
}

/**
 * Interface cho settings state
 */
export interface ISettingsState {
  notifications: INotificationSettings;
  display: IDisplaySettings;
  language: string;
}

/**
 * Interface cho settings actions
 */
export interface ISettingsActions {
  updateNotificationSettings: (settings: Partial<INotificationSettings>) => void;
  updateDisplaySettings: (settings: Partial<IDisplaySettings>) => void;
  setLanguage: (language: string) => void;
  resetSettings: () => void;
}

/**
 * Interface cho settings store
 */
export type SettingsStore = ISettingsState & ISettingsActions;

/**
 * Initial state cho settings store
 */
const initialState: ISettingsState = {
  notifications: {
    email: true,
    push: true,
    marketing: false,
    newCourses: true,
    courseUpdates: true,
    examReminders: true,
  },
  display: {
    fontSize: "medium",
    contrastMode: false,
    reduceAnimations: false,
    showProgressBar: true,
  },
  language: "vi",
};

/**
 * Settings store
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      /**
       * Update notification settings
       */
      updateNotificationSettings: (settings) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...settings,
          },
        }));
      },

      /**
       * Update display settings
       */
      updateDisplaySettings: (settings) => {
        set((state) => ({
          display: {
            ...state.display,
            ...settings,
          },
        }));
      },

      /**
       * Set language
       */
      setLanguage: (language) => {
        set({ language });
      },

      /**
       * Reset settings
       */
      resetSettings: () => {
        set(initialState);
      },
    }),
    {
      name: "user-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
