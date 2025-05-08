import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState, AppThunk } from '../../App';
import {
  Entry as CacheEntry,
  Pending as CachePending,
  CacheElement,
} from '../../mapping/cacheSlice';

interface InitialState {
  all: { [key: string]: string[] };
  current: string | null;
}

const initialState: InitialState = {
  current: 'init',
  all: {},
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

export const isSegment = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return keys.includes('startWaypoint') && keys.includes('endWaypoint');
};

export const trajectoriesSlice = createSlice({
  name: 'trajectories',
  initialState,
  reducers: {
    newTrajectory: (state, trajectoryId: PayloadAction<string>) => {
      const trajectoryExists = state.all[trajectoryId.payload];
      if (!trajectoryExists) state.all[trajectoryId.payload] = [];
    },
    updateCurrentTrajectory: (state, update: PayloadAction<string[]>) => {
      // Append a waypoint ID to a trajectory
      if (state.current) {
        state.all[state.current] = update.payload;
      }
    },
  },
});

export const { newTrajectory, updateCurrentTrajectory } =
  trajectoriesSlice.actions;

export const appendWaypointToCurrentTrajectory =
  (id: string): AppThunk =>
  (dispatch, getState: () => RootState) => {
    const state = getState();
    const currentTrajectoryId = state.trajectories.current;

    if (currentTrajectoryId) {
      const currentTrajectory = [
        ...state.trajectories.all[currentTrajectoryId],
      ];
      currentTrajectory.push(id);
      const sortedCurrentTrajectory = currentTrajectory.sort(
        (a: string, b: string): -1 | 0 | 1 => {
          // this sort function takes two waypoint IDs, gets their
          // respective 'time' properties via the cache
          // and orders them chronologically
          const cacheEntryA: CacheElement = state.cache[a];
          const cacheEntryB: CacheElement = state.cache[b];
          if (
            cacheEntryA.time &&
            cacheEntryB.time &&
            typeof cacheEntryA.time == 'string' &&
            typeof cacheEntryB.time == 'string'
          ) {
            const aTime = new Date(cacheEntryA.time);
            const bTime = new Date(cacheEntryB.time);
            if (aTime < bTime) {
              return -1;
            }
            if (aTime > bTime) {
              return 1;
            }
          }
          return 0;
        },
      );
      dispatch(updateCurrentTrajectory(sortedCurrentTrajectory));
    }
  };

export const selectTrajectories = (state: RootState) => state.trajectories.all;

export const selectCurrentTrajectoryId = (state: RootState) =>
  state.trajectories.current;
export const selectCurrentTrajectory = (state: RootState) => {
  if (state.trajectories.current) {
    return state.trajectories.all[state.trajectories.current];
  } else {
    return null;
  }
};

export default trajectoriesSlice.reducer;
