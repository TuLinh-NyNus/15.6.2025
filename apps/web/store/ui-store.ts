import { create } from "zustand";

/**
 * Interface cho UI state
 */
export interface IUIState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, any> | undefined;
}

/**
 * Interface cho UI actions
 */
export interface IUIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (isOpen: boolean) => void;
  openModal: (modalId: string, data?: Record<string, any>) => void;
  closeModal: () => void;
}

/**
 * Interface cho UI store
 */
export type UIStore = IUIState & IUIActions;

/**
 * Initial state cho UI store
 */
const initialState: IUIState = {
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  activeModal: null,
  modalData: undefined,
};

/**
 * UI store
 */
export const useUIStore = create<UIStore>((set) => ({
  ...initialState,

  /**
   * Toggle sidebar
   */
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  /**
   * Set sidebar open
   */
  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  /**
   * Set mobile menu open
   */
  setMobileMenuOpen: (isOpen) => {
    set({ isMobileMenuOpen: isOpen });
  },

  /**
   * Toggle search
   */
  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  /**
   * Set search open
   */
  setSearchOpen: (isOpen) => {
    set({ isSearchOpen: isOpen });
  },

  /**
   * Open modal
   */
  openModal: (modalId, data = undefined) => {
    set({ activeModal: modalId, modalData: data });
  },

  /**
   * Close modal
   */
  closeModal: () => {
    set({ activeModal: null, modalData: undefined });
  },
}));
