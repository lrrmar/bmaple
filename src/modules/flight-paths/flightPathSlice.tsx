import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import {
  Entry as CacheEntry,
  Pending as CachePending,
  CacheElement,
} from '../../mapping/cacheSlice';

interface InitialState {}

const initialState: InitialState = {};

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

export const isFlightPath = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return keys.includes('startWaypoint') && keys.includes('endWaypoint');
};

export const flightPathSlice = createSlice({
  name: 'flightPath',
  initialState,
  reducers: {},
});

//export const {  } = waypointSlice.actions;
export const selectTimes = (state: RootState) => {
  const flightPathIds = Object.keys(state.cache).filter(
    (id) => state.cache[id].source === 'flight',
  );
  const flightPaths = flightPathIds.map((id) => state.cache[id]);
  const startWaypointIds: (string | null)[] = flightPaths.map((path) =>
    typeof path.startWaypoint == 'string' ? path.startWaypoint : null,
  );
  const startWaypoints: Waypoint[] = [];
  startWaypointIds.forEach((id) => {
    if (id) {
      const entry = state.cache[id];
      if (isWaypoint(entry)) startWaypoints.push(entry);
    }
  });
  // QUICK FIX!!! NEED TO UNDERSTAND WHY LINES ARE DOUBLING UP IN FLIGHT TRACK
  // SOURCE PROCESSES...?
  const times = [...new Set(startWaypoints.map((waypoint) => waypoint.time))];
  times.sort();
  return times;
};
export default flightPathSlice.reducer;
