import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';

interface GenericLayerMixIn {
  [key: string]: GenericLayerMixIn | string[] | string | number[] | number;
}

export interface Pending {
  source: string;
}

export interface Entry extends Pending, GenericLayerMixIn {
  source: string;
  ol_uid: string;
}

export type CacheElement = Pending | Entry;

export interface Cache {
  [key: string]: CacheElement;
}

interface InitialState {
  [key: string]: CacheElement;
}

export interface Request extends Pending {
  id: string;
}

export interface Ingest extends Entry {
  id: string;
}

export interface Update extends GenericLayerMixIn {
  id: string;
}

export interface Remove {
  id: string;
}

const isPending = (element: CacheElement): element is Pending => {
  const keys: string[] = Object.keys(element);
  return keys.includes('source') && !keys.includes('ol_uid');
};

const isEntry = (element: CacheElement): element is Entry => {
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
        const source: string = request.source;
        cache[id] = { source: source };
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
        const updates: GenericLayerMixIn = update;
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
