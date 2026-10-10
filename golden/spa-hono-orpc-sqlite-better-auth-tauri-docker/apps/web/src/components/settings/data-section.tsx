import { open } from "@tauri-apps/plugin-dialog";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@my-app/ui/components/button";

import { db } from "#src/lib/db.ts";
import { isDesktop } from "#src/lib/window.ts";
import { m } from "#src/paraglide/messages.js";

const DIR_KEY = "dataDir";
const DIR_STORE = "settings";

// The storage directory: where the desktop app keeps its local data. The
// choice persists now and applies on the next launch; in a browser the
// storage is per-origin and this section explains that instead.
export const DataSection = () => {
  const [dir, setDir] = useState<string | undefined>();

  useEffect(() => {
    void db.get<string>(DIR_STORE, DIR_KEY).then(setDir);
  }, []);

  const choose = async () => {
    const picked = await open({ directory: true });
    if (typeof picked !== "string") {
      return;
    }
    await db.set(DIR_STORE, DIR_KEY, picked);
    setDir(picked);
    toast(m.data_dir_chosen());
  };

  if (!isDesktop) {
    return (
      <section id="data">
        <h3 className="mb-1 text-sm font-medium">{m.settings_data()}</h3>
        <p className="text-muted-foreground text-sm">{m.data_dir_browser()}</p>
      </section>
    );
  }

  return (
    <section id="data">
      <h3 className="mb-1 text-sm font-medium">{m.data_dir_title()}</h3>
      <p className="text-muted-foreground mb-3 text-sm">{m.data_dir_desc()}</p>
      <p className="text-muted-foreground mb-2 font-mono text-xs">
        {m.data_dir_current()}: {dir ?? "—"}
      </p>
      <Button
        onClick={() => {
          void choose();
        }}
        variant="outline"
      >
        {m.data_dir_choose()}
      </Button>
    </section>
  );
};
