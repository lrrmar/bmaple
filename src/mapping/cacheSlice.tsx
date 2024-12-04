import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';

interface InitialState {
  [key: string]: CacheEntry | CacheRequest;
}

interface CacheEntry extends GenericLayerMixIn {
  source: string;
  ol_uid: string;
}

interface CacheRequest {
  source: string;
}

interface GenericLayerMixIn {
  [key: string]: number | string;
}

// RequestLayer?
export interface Request {
  id: string;
  source: string; // Get config array from App?
}

export interface Ingest extends GenericLayerMixIn {
  id: string;
  source: string;
  ol_uid: string;
}

export interface Update extends GenericLayerMixIn {
  id: string;
}

export interface Remove {
  id: string;
}

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
        const entry: Ingest | CacheEntry = ingest;
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
        const keys: string[] = Object.keys(update).filter(
          (key) => key !== 'id',
        );
        const entry: { [key: string]: string | number } = {};
        keys.map((key) => (entry[key] = update[key]));
        cache[id] = { ...cache[id], ...entry };
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
export default cacheSlice.reducer;
