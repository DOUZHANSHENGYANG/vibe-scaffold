import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

// Client state lives in `src/stores`, one store per concern, typed where it is
// created. Server data stays in TanStack Query, not here.
export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => {
    set((state) => ({ count: state.count + 1 }));
  },
  reset: () => {
    set({ count: 0 });
  },
}));
