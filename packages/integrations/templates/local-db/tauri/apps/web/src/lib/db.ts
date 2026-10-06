import { openDB, type IDBPDatabase } from "idb";

/** One key-value entry namespaced by store. */
export interface Entry<T> {
  key: string;
  store: string;
  value: T;
}

/**
 * The local database: namespaced key-value pairs that persist in this origin.
 * Inside Tauri it is SQLite through the SQL plugin; in a plain browser it is
 * IndexedDB, so `vp dev` in a tab works against the same calls.
 */
export interface LocalDb {
  delete(store: string, key: string): Promise<void>;
  entries<T>(store: string): Promise<Entry<T>[]>;
  get<T>(store: string, key: string): Promise<T | undefined>;
  set<T>(store: string, key: string, value: T): Promise<void>;
}

interface KvRecord {
  key: string;
  store: string;
  value: unknown;
}

interface SqlClient {
  execute(query: string, bindValues?: unknown[]): Promise<unknown>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T[]>;
}

let webClient: IDBPDatabase<KvRecord> | undefined;

const createWebDb = async (): Promise<LocalDb> => {
  webClient ??= await openDB<KvRecord>("my-app", 1, {
    upgrade(database) {
      database.createObjectStore("kv", { keyPath: ["store", "key"] });
    },
  });
  const client = webClient;
  return {
    async delete(store: string, key: string): Promise<void> {
      await client.delete("kv", [store, key]);
    },
    async entries<T>(store: string): Promise<Entry<T>[]> {
      const rows = await client.getAll("kv");
      return rows
        .filter((row) => row.store === store)
        .map(({ key, value }) => ({ key, store, value: value as T }));
    },
    async get<T>(store: string, key: string): Promise<T | undefined> {
      return ((await client.get("kv", [store, key]))?.value ?? undefined) as
        | T
        | undefined;
    },
    async set<T>(store: string, key: string, value: T): Promise<void> {
      await client.put("kv", { key, store, value });
    },
  };
};

let sqlClient: SqlClient | undefined;

const createTauriDb = async (): Promise<LocalDb> => {
  sqlClient ??= (await import("@tauri-apps/plugin-sql")).default;
  const client = await sqlClient.load("sqlite:my-app.db");
  await client.execute(
    "CREATE TABLE IF NOT EXISTS kv (store TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (store, key))"
  );
  return {
    async delete(store: string, key: string): Promise<void> {
      await client.execute("DELETE FROM kv WHERE store = $1 AND key = $2", [
        store,
        key,
      ]);
    },
    async entries<T>(store: string): Promise<Entry<T>[]> {
      const rows = await client.select<{ key: string; value: string }[]>(
        "SELECT key, value FROM kv WHERE store = $1",
        [store]
      );
      return rows.map(({ key, value }) => ({
        key,
        store,
        value: JSON.parse(value) as T,
      }));
    },
    async get<T>(store: string, key: string): Promise<T | undefined> {
      const rows = await client.select<{ value: string }[]>(
        "SELECT value FROM kv WHERE store = $1 AND key = $2",
        [store, key]
      );
      return rows[0] === undefined
        ? undefined
        : (JSON.parse(rows[0].value) as T);
    },
    async set<T>(store: string, key: string, value: T): Promise<void> {
      await client.execute(
        "INSERT INTO kv (store, key, value) VALUES ($1, $2, $3) ON CONFLICT (store, key) DO UPDATE SET value = $3",
        [store, key, JSON.stringify(value)]
      );
    },
  };
};

const inTauri = "__TAURI_INTERNALS__" in globalThis;
let backend: Promise<LocalDb> | undefined;
const load = (): Promise<LocalDb> =>
  (backend ??= inTauri ? createTauriDb() : createWebDb());

export const db: LocalDb = {
  async delete(store: string, key: string): Promise<void> {
    await (await load()).delete(store, key);
  },
  async entries<T>(store: string): Promise<Entry<T>[]> {
    return (await load()).entries<T>(store);
  },
  async get<T>(store: string, key: string): Promise<T | undefined> {
    return (await load()).get<T>(store, key);
  },
  async set<T>(store: string, key: string, value: T): Promise<void> {
    await (await load()).set(store, key, value);
  },
};
