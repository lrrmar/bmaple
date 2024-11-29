import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';

interface InitialState {
  [key: string]: {
    [key: string]: string | number;
  };
}

interface GenericLayerMixIn {
  [key: string]: number | string;
}

// RequestLayer?
interface GetLayer {
  id: string;
  source: string; // Get config array from App?
}

interface PostLayer extends GenericLayerMixIn {
  id: string;
  ol_uid: string;
}

interface PutLayer extends GenericLayerMixIn {
  id: string;
  ol_uid: string;
}

interface DeleteLayer {
  id: string;
}

const initialState: InitialState = {};

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    getLayer: (state, data: PayloadAction<GetLayer>) => {
      const id: string = data.payload.id;
      const source: string = data.payload.source;
      state[id] = { source: source };
    },
    postLayer: (state, data: PayloadAction<PostLayer>) => {
      const id: string = data.payload.id;
      const keys = Object.keys(data.payload).filter((key) => key !== 'id');
      const entry: { [key: string]: string | number } = {};
      keys.map((key) => (entry[key] = data.payload[key]));
      state[id] = entry;
    },
    putLayer: (state, data: PayloadAction<PutLayer>) => {
      const id: string = data.payload.id;
      const keys: string[] = Object.keys(data.payload).filter(
        (key) => key !== 'id',
      );
      const entry: { [key: string]: string | number } = {};
      keys.map((key) => (entry[key] = data.payload[key]));
      state[id] = { ...state[id], ...entry };
    },
    deleteLayer: (state, data: PayloadAction<DeleteLayer>) => {
      const id: string = data.payload.id;
      delete state[id];
    },
  },
});

export const { getLayer, postLayer, putLayer, deleteLayer } =
  cacheSlice.actions;

export const selectCache = (state: RootState) => state.cache;
export default cacheSlice.reducer;
