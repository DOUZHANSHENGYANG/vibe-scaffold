import { Button } from "@my-app/ui/components/button";
import { toast } from "sonner";

import { m } from "#src/paraglide/messages.js";
import { db } from "#src/lib/db.ts";
import { isDesktop } from "#src/lib/window.ts";

// The storage section: shows which backend `db` picked and offers a reset.
// Each feature's store is listed here; the section knows the demo stores.
const stores = ["demo", "todos"];

export const DataSection = () => (
  <section id="data">
    <h3 className="mb-1 text-sm font-medium">{m.settings_data()}</h3>
    <p className="text-muted-foreground mb-3 text-sm">
      {m.data_backend()}:{" "}
      {isDesktop ? m.data_backend_sqlite() : m.data_backend_indexeddb()}
    </p>
    <Button
      onClick={() => {
        const clear = async () => {
          for (const store of stores) {
            for (const entry of await db.entries(store)) {
              await db.delete(entry.store, entry.key);
            }
          }
          toast(m.data_cleared());
        };
        clear().catch(() => {
          toast.error("Clear failed");
        });
      }}
      variant="outline"
    >
      {m.data_clear()}
    </Button>
  </section>
);
