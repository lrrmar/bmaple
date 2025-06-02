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
  highlightedTrajectories: string[];
}

const initialState: InitialState = {
  current: 'init',
  all: {},
  highlightedTrajectories: [],
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
    updateHighlightedTrajectories: (
      state,
      ids: PayloadAction<string | string[]>,
    ) => {
      const toUpdate: string[] = Array.isArray(ids.payload)
        ? ids.payload
        : [ids.payload];
      state.highlightedTrajectories = toUpdate;
    },
    removeWaypointFromAllTrajectories: (state, id: PayloadAction<string>) => {
      const allTrajectories = state.all;
      Object.keys(allTrajectories).forEach((trajectoryId) => {
        const trajectory = allTrajectories[trajectoryId];
        const index = trajectory.indexOf(id.payload);
        trajectory.splice(index, 1);
        allTrajectories[trajectoryId] = trajectory;
      });
      console.log(allTrajectories);
      console.log(state.all);
      state.all = allTrajectories;
    },
  },
});

export const {
  newTrajectory,
  updateCurrentTrajectory,
  updateHighlightedTrajectories,
  removeWaypointFromAllTrajectories,
} = trajectoriesSlice.actions;

export const appendWaypointToCurrentTrajectory =
  (id: string): AppThunk =>
  (dispatch, getState: () => RootState) => {
    const state = getState();
    const currentTrajectoryId = state.trajectories.current;

    if (currentTrajectoryId) {
      const currentTrajectory = [
        ...state.trajectories.all[currentTrajectoryId],
      ];
      console.log(currentTrajectory);
      currentTrajectory.push(id);
      console.log(currentTrajectory);
      let sortedCurrentTrajectory: string[];
      if (currentTrajectory.length > 1) {
        sortedCurrentTrajectory = currentTrajectory.sort(
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
      } else {
        sortedCurrentTrajectory = currentTrajectory;
      }
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
export const selectHighlightedTrajectories = (state: RootState) =>
  state.trajectories.highlightedTrajectories;

export default trajectoriesSlice.reducer;
