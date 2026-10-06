import { openDB, type IDBPDatabase } from "idb";

/** One key-value entry namespaced by store. */
export interface Entry<T> {
  key: string;
  store: string;
  value: T;
}

/**
 * The local database: namespaced key-value pairs that persist in this origin.
 * The same calls run on every backend, so feature code never asks where it runs.
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

let backend: Promise<LocalDb> | undefined;
const load = (): Promise<LocalDb> => (backend ??= createWebDb());

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
