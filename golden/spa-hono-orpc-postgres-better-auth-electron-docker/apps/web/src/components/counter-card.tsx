import { useCounterStore } from "#src/stores/counter.ts";

// The starter demo for `zustand`: client state read from a store with selectors.
export const CounterCard = () => {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <button
      className="text-foreground border-border hover:bg-accent rounded-md border px-3 py-1 text-sm"
      onClick={increment}
      type="button"
    >
      {count}
    </button>
  );
};
