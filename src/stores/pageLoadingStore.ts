import { create } from 'zustand';

const DEFAULT_PAGE_LOADING_LABEL = '화면을 불러오고 있습니다.';

interface PageLoadingEntry {
  id: string;
  label: string;
}

interface PageLoadingState {
  entries: PageLoadingEntry[];
  open: (label?: string) => string;
  close: (options?: string | { id?: string; all?: boolean }) => void;
}

const createPageLoadingId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `page-loading-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const usePageLoadingStore = create<PageLoadingState>((set) => ({
  entries: [],
  open: (label = DEFAULT_PAGE_LOADING_LABEL) => {
    const id = createPageLoadingId();

    set((state) => ({
      entries: [...state.entries, { id, label }],
    }));

    return id;
  },
  close: (options) => {
    set((state) => {
      if (state.entries.length === 0) {
        return state;
      }

      if (typeof options === 'object' && options?.all) {
        return { entries: [] };
      }

      const id = typeof options === 'string' ? options : options?.id;

      if (id) {
        return {
          entries: state.entries.filter((entry) => entry.id !== id),
        };
      }

      return {
        entries: state.entries.slice(0, -1),
      };
    });
  },
}));

export const openPageLoading = (label?: string) => usePageLoadingStore.getState().open(label);

export const closePageLoading = (options?: string | { id?: string; all?: boolean }) => {
  usePageLoadingStore.getState().close(options);
};
