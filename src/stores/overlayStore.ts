import { create } from 'zustand';

export type OverlayType = 'dialog' | 'alert' | 'confirm' | 'bottomSheet';

export interface OverlayEntry {
  id: string;
  type: OverlayType;
  close: () => void;
  closeOnBack: boolean;
}

interface OverlayState {
  stack: OverlayEntry[];
  registerOverlay: (entry: OverlayEntry) => void;
  unregisterOverlay: (id: string) => void;
  closeTopOverlay: () => boolean;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  stack: [],
  registerOverlay: (entry) =>
    set((state) => {
      const currentIndex = state.stack.findIndex((item) => item.id === entry.id);

      if (currentIndex === -1) {
        return { stack: [...state.stack, entry] };
      }

      return {
        stack: state.stack.map((item) => (item.id === entry.id ? entry : item)),
      };
    }),
  unregisterOverlay: (id) =>
    set((state) => ({
      stack: state.stack.filter((entry) => entry.id !== id),
    })),
  closeTopOverlay: () => {
    const topOverlay = get().stack.at(-1);

    if (!topOverlay || !topOverlay.closeOnBack) {
      return false;
    }

    topOverlay.close();
    return true;
  },
}));

export const closeTopOverlay = () => useOverlayStore.getState().closeTopOverlay();

export const hasOpenOverlay = () => useOverlayStore.getState().stack.length > 0;
