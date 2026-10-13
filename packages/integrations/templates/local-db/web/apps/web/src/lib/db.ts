import type Database from "@tauri-apps/plugin-sql";
import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import { z } from "zod";

/** JSON-safe values: the only shapes a key-value entry may hold. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

const parseJson = (text: string): JsonValue => jsonValueSchema.parse(text);

interface KvRecord {
  key: string;
  store: string;
  value: JsonValue;
}

interface KvDb extends DBSchema {
  kv: {
    key: [store: string, key: string];
    value: KvRecord;
  };
}

/** A typed key-value entry: the parse function is the schema boundary. */
export interface KvEntry<T> {
  delete: () => Promise<void>;
  get: () => Promise<T | undefined>;
  set: (value: T) => Promise<void>;
}

interface SqlRow {
  key: string;
  value: string;
}

let webClient: IDBPDatabase<KvDb> | undefined;

const createWebDb = async (): Promise<KvClient> => {
  webClient ??= await openDB<KvDb>("my-app", 1, {
    upgrade(database) {
      database.createObjectStore("kv", { keyPath: ["store", "key"] });
    },
  });
  const client = webClient;
  return {
    delete: async (store, key) => {
      await client.delete("kv", [store, key]);
    },
    get: async (store, key) => {
      const row = await client.get("kv", [store, key]);
      return row?.value;
    },
    set: async (store, key, value) => {
      await client.put("kv", { key, store, value });
    },
  };
};

interface KvClient {
  delete: (store: string, key: string) => Promise<void>;
  get: (store: string, key: string) => Promise<JsonValue | undefined>;
  set: (store: string, key: string, value: JsonValue) => Promise<void>;
}

let sqlClient: Database | undefined;

const createTauriDb = async (): Promise<KvClient> => {
  sqlClient ??= await (async () => {
    const plugin = await import("@tauri-apps/plugin-sql");
    return new plugin.default("sqlite:my-app.db");
  })();
  const client = sqlClient;
  await client.execute(
    "CREATE TABLE IF NOT EXISTS kv (store TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (store, key))"
  );
  return {
    delete: async (store, key) => {
      await client.execute("DELETE FROM kv WHERE store = $1 AND key = $2", [
        store,
        key,
      ]);
    },
    get: async (store, key) => {
      const rows = await client.select<SqlRow[]>(
        "SELECT value FROM kv WHERE store = $1 AND key = $2",
        [store, key]
      );
      const [row] = rows;
      return row === undefined ? undefined : parseJson(row.value);
    },
    set: async (store, key, value) => {
      await client.execute(
        "INSERT INTO kv (store, key, value) VALUES ($1, $2, $3) ON CONFLICT (store, key) DO UPDATE SET value = $3",
        [store, key, JSON.stringify(value)]
      );
    },
  };
};

const inTauri = "__TAURI_INTERNALS__" in globalThis;
let backend: Promise<KvClient> | undefined;
const load = async (): Promise<KvClient> =>
  await (backend ??= inTauri ? createTauriDb() : createWebDb());

const parseSafely = <T>(
  parse: (value: JsonValue) => T,
  raw: JsonValue
): T | undefined => {
  try {
    return parse(raw);
  } catch {
    // A payload from an older schema version reads as absent.
    return undefined;
  }
};

/**
 * Defines one typed entry of the local database. The local database persists
 * in this origin: inside Tauri it is SQLite through the SQL plugin, in a plain
 * browser it is IndexedDB, so `vp dev` in a tab works against the same calls.
 * The parse function turns the stored JSON into the domain value at the
 * boundary; a payload that does not parse reads as absent.
 */
export const defineEntry = <T extends JsonValue>(
  store: string,
  key: string,
  parse: (value: JsonValue) => T
): KvEntry<T> => ({
  delete: async () => {
    const client = await load();
    await client.delete(store, key);
  },
  get: async () => {
    const client = await load();
    const raw = await client.get(store, key);
    return raw === undefined ? undefined : parseSafely(parse, raw);
  },
  set: async (value) => {
    const client = await load();
    await client.set(store, key, value);
  },
});

/** A string entry: any non-string payload reads as absent. */
const isString = (value: JsonValue): value is string =>
  Object.prototype.toString.call(value) === "[object String]";

export const defineStringEntry = (
  store: string,
  key: string
): KvEntry<string> =>
  defineEntry(store, key, (value) => {
    if (isString(value)) {
      return value;
    }
    throw new Error("expected a string payload");
  });

/** A number entry: any non-number payload reads as absent. */
const isNumber = (value: JsonValue): value is number =>
  Object.prototype.toString.call(value) === "[object Number]";

export const defineNumberEntry = (store: string, key: string): KvEntry<number> =>
  defineEntry(store, key, (value) => {
    if (isNumber(value)) {
      return value;
    }
    throw new Error("expected a number payload");
  });
