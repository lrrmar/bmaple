import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import {
  Entry as CacheEntry,
  Pending as CachePending,
  CacheElement,
} from '../../mapping/cacheSlice';

interface Timeseries {
  times: string[];
  values: number[];
}

interface InitialState {
  [key: string]: Timeseries;
}

const initialState: InitialState = {};

export const timeseriesSlice = createSlice({
  name: 'timeseries',
  initialState,
  reducers: {},
});

//export const {  } = waypointSlice.actions;
export const selectTimeseries = (state: RootState) => {
  return state.timeseries;
};
export default timeseriesSlice.reducer;
