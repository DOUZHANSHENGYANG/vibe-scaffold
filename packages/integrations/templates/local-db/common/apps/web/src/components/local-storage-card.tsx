import { useEffect, useState } from "react";

import { db } from "#src/lib/db.ts";

const countStore = "demo";
const countKey = "visits";

// The generated demo for `db`: a counter that survives restarts, in this
// webview and across them, through the same calls on every backend.
export const LocalStorageCard = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    void db.get<number>(countStore, countKey).then((value) => {
      setCount(value ?? 0);
    });
  }, []);

  const increment = () => {
    setCount((current) => {
      const next = current + 1;
      void db.set(countStore, countKey, next);
      return next;
    });
  };

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
