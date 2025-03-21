import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';

export interface Generic {
  [key: string]:
    | Generic
    | string[]
    | string
    | number[]
    | number
    | undefined
    | null;
}

export interface Pending {
  source: string;
}

export interface Entry extends Pending {
  ol_uid: string;
}

export type CacheElement =
  | (Pending & Partial<Generic>)
  | (Entry & Partial<Generic>);

export interface Cache {
  [key: string]: CacheElement;
}

interface InitialState {
  [key: string]: CacheElement;
}

interface Action {
  id: string;
}

export type Request = Pending & Action & Partial<Generic>;
export type Ingest = Entry & Action & Partial<Generic>;
export type Update = Action & Partial<Generic>;
export type Remove = Action;

export const isPending = (element: any): element is Pending => {
  const keys: string[] = Object.keys(element);
  return keys.includes('source') && !keys.includes('ol_uid');
};

export const isEntry = (element: any): element is Entry => {
  const keys: string[] = Object.keys(element);
  return keys.includes('source') && keys.includes('ol_uid');
};

const initialState: InitialState = {};

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    request: (state, data: PayloadAction<Request | Request[]>) => {
      const cache = state;
      // Handle single or array of Request
      const toRequest: Request[] = Array.isArray(data.payload)
        ? data.payload
        : [data.payload];
      toRequest.forEach((request: Request) => {
        const id: string = request.id;
        delete request[id];
        cache[id] = request;
      });
      state = cache;
    },
    ingest: (state, data: PayloadAction<Ingest | Ingest[]>) => {
      const cache = state;
      // Handle single or array of Request
      const toIngest: Ingest[] = Array.isArray(data.payload)
        ? data.payload
        : [data.payload];
      toIngest.forEach((ingest: Ingest) => {
        const id: string = ingest.id;
        const entry: Ingest = ingest;
        delete entry[id];
        cache[id] = entry;
      });
      state = cache;
    },
    update: (state, data: PayloadAction<Update | Update[]>) => {
      const cache = state;
      // Handle single or array of Request
      const toUpdate: Update[] = Array.isArray(data.payload)
        ? data.payload
        : [data.payload];
      toUpdate.forEach((update: Update) => {
        const id: string = update.id;
        if (!isEntry(cache[id])) return;
        const updates: Generic = update;
        delete updates.id;
        cache[id] = { ...cache[id], ...updates };
      });
      state = cache;
    },
    remove: (state, data: PayloadAction<Remove | Remove[]>) => {
      const cache = state;
      // Handle single or array of Request
      const toRemove: Remove[] = Array.isArray(data.payload)
        ? data.payload
        : [data.payload];
      toRemove.forEach((remove: Remove) => {
        const id: string = remove.id;
        delete cache[id];
      });
      state = cache;
    },
  },
});

export const { request, ingest, update, remove } = cacheSlice.actions;
export const selectCache = (state: RootState) => state.cache;
export const selectCacheEntries = (state: RootState) => {
  const cache: Cache = state.cache;
  const entries: { [key: string]: Entry } = {};
  Object.keys(cache).forEach((key: string) => {
    const element: CacheElement = cache[key];
    if (isEntry(element)) entries[key] = element;
  });
  return entries;
};
export const selectCachePending = (state: RootState) => {
  const cache: Cache = state.cache;
  const pending: { [key: string]: Pending } = {};
  Object.keys(cache).forEach((key: string) => {
    const element: CacheElement = cache[key];
    if (isPending(element)) pending[key] = element;
  });
  return pending;
};
export default cacheSlice.reducer;
