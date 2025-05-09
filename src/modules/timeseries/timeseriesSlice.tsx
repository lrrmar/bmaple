import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import {
  Entry as CacheEntry,
  Pending as CachePending,
  CacheElement,
} from '../../mapping/cacheSlice';

export interface Timeseries {
  times: string[];
  data: number[];
  variable: string;
  units: string;
}

interface InitialState {
  all: { [key: string]: Timeseries };
  displayed: string[];
}

const initialState: InitialState = {
  all: {},
  displayed: ['flight'],
};

export const timeseriesSlice = createSlice({
  name: 'timeseries',
  initialState,
  reducers: {
    updateTimeseries: (
      state,
      update: PayloadAction<{ id: string; timeseries: Timeseries }>,
    ) => {
      state.all[update.payload.id] = update.payload.timeseries;
      const ids = Object.keys(state.all);
      const currentDisplayed = state.displayed;
      const updatedDisplayed: string[] = [];
      state.displayed = updatedDisplayed;
      currentDisplayed.forEach((id) => {
        if (ids.includes(id)) {
          updatedDisplayed.push(id);
        }
      });
    },
    deleteTimeseries: (state, id: PayloadAction<string>) => {
      const copy = state.all;
      delete copy[id.payload];
      state.all = copy;
    },
  },
});

export const { updateTimeseries, deleteTimeseries } = timeseriesSlice.actions;
export const selectTimeseries = (state: RootState) => {
  return state.timeseries.all;
};
export const selectDisplayed = (state: RootState) => {
  return state.timeseries.displayed;
};
export default timeseriesSlice.reducer;
