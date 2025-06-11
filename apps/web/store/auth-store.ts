import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Interface cho user
 */
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  avatar?: string;
}

/**
 * Interface cho auth state
 */
export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Interface cho auth actions
 */
export interface IAuthActions {
  setUser: (user: IUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Interface cho auth store
 */
export type AuthStore = IAuthState & IAuthActions;

/**
 * Initial state cho auth store
 */
const initialState: IAuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Auth store
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      /**
       * Set user
       */
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      /**
       * Set tokens
       */
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      /**
       * Clear tokens
       */
      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      /**
       * Logout
       */
      logout: () => {
        set(initialState);
      },

      /**
       * Set loading
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set error
       */
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
