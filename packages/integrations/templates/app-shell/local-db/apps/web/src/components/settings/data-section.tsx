import { Button } from "@my-app/ui/components/button";
import { toast } from "sonner";

import { m } from "#/paraglide/messages.js";
import { db } from "#src/lib/db.ts";
import { isDesktop } from "#src/lib/window.ts";

// The storage section: shows which backend `db` picked and offers a reset.
export const DataSection = () => (
  <section id="data">
    <h3 className="mb-1 text-sm font-medium">{m.settings_data()}</h3>
    <p className="text-muted-foreground mb-3 text-sm">
      {m.data_backend()}:{" "}
      {isDesktop ? m.data_backend_sqlite() : m.data_backend_indexeddb()}
    </p>
    <Button
      onClick={() => {
        void Promise.all([
          db.entries("todos"),
          db.entries("demo"),
        ]).then(async ([todos, demo]) => {
          await Promise.all(
            [...todos, ...demo].map((entry) =>
              db.delete(entry.store, entry.key)
            )
          );
          toast(m.data_cleared());
        });
      }}
      variant="outline"
    >
      {m.data_clear()}
    </Button>
  </section>
);
