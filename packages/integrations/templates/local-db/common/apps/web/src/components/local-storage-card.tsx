import { useEffect, useState } from "react";

import { defineNumberEntry } from "#src/lib/db.ts";

const visits = defineNumberEntry("demo", "visits");

// The generated demo for the local database: a counter that survives
// restarts, in this webview and across them, through the same calls on every
// backend.
export const LocalStorageCard = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    void (async () => {
      setCount((await visits.get()) ?? 0);
    })();
  }, []);

  const increment = () => {
    setCount((current) => {
      const next = current + 1;
      void visits.set(next);
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
