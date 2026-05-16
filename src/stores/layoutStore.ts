import { create } from 'zustand';

interface FixedAreaState {
  topOffset: number;
  bottomOffset: number;
  headerVisible: boolean;
  floatingMenuVisible: boolean;
  revision: number;
  setTopOffset: (topOffset: number) => void;
  setBottomOffset: (bottomOffset: number) => void;
  setHeaderVisible: (headerVisible: boolean) => void;
  setFloatingMenuVisible: (floatingMenuVisible: boolean) => void;
  requestLayoutRecalculate: () => void;
}

export const useLayoutStore = create<FixedAreaState>((set) => ({
  topOffset: 0,
  bottomOffset: 0,
  headerVisible: true,
  floatingMenuVisible: true,
  revision: 0,
  setTopOffset: (topOffset) => set({ topOffset }),
  setBottomOffset: (bottomOffset) => set({ bottomOffset }),
  setHeaderVisible: (headerVisible) => set({ headerVisible }),
  setFloatingMenuVisible: (floatingMenuVisible) => set({ floatingMenuVisible }),
  requestLayoutRecalculate: () => set((state) => ({ revision: state.revision + 1 })),
}));
