import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import {
  Entry as CacheEntry,
  Pending as CachePending,
  CacheElement,
} from '../../mapping/cacheSlice';

interface InitialState {
  profileIds: string[];
  mode: string | undefined;
}

const initialState: InitialState = {
  profileIds: [],
  mode: 'default',
};

export interface GenericLayerMixIn {
  [key: string]: GenericLayerMixIn | string[] | string | number[] | number;
}

export interface LongitudeLatitude {
  longitude: number;
  latitude: number;
}

export interface Waypoint extends GenericLayerMixIn, LongitudeLatitude {}

export const isWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return keys.includes('latitude') && keys.includes('longitude');
};

export const waypointSlice = createSlice({
  name: 'waypoint',
  initialState,
  reducers: {
    appendProfileIds: (state, ids: PayloadAction<string | string[]>) => {
      const profileIds = state.profileIds;
      // Handle single or array
      const toAppend: string[] = Array.isArray(ids.payload)
        ? ids.payload
        : [ids.payload];
      profileIds.concat(toAppend);
      state.profileIds = profileIds;
    },
  },
});

export const { appendProfileIds } = waypointSlice.actions;
export const selectProfileIds = (state: RootState) => state.waypoint.profileIds;
export const selectMode = (state: RootState) => state.waypoint.mode;
export const selectWaypoints = (state: RootState) =>
  state.waypoint.profileIds.map((id) => state.cache[id]);
export default waypointSlice.reducer;
