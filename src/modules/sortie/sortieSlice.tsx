import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { type Waypoint} from './lib/state/types';
import { type RoutineSequence } from './lib/io/types';

type SortieFormKey  =
  | 'Mission Scientist'
  | 'Author'
  | 'Approver'
  | 'Scientific Aims'
  | 'Planned T/O Time'
  | 'Departure Airport'
  | 'Landing Airport'
  | 'FIRS / Zones'
  | 'Weather Conditions'
  | 'Instrument Servicability'
  | 'Special Notes ';

const sortieFormKeys: SortieFormKey[] = [
  'Mission Scientist',
  'Author',
  'Approver',
  'Scientific Aims',
  'Planned T/O Time',
  'Departure Airport',
  'Landing Airport',
  'FIRS / Zones',
  'Weather Conditions',
  'Instrument Servicability',
  'Special Notes ',
]


interface InitialState {
  flightPlan: RoutineSequence;
  waypoints: Waypoint[];
  sortieForm: {
    [key: string]: string;
  }
  highlightedRoutines: string[];
  highlightedWaypoints: string[];
}
const initialState: InitialState = {
  flightPlan: [],
  waypoints: [],
  sortieForm: {
  'Mission Scientist': '',
  'Author': '',
  'Approver': '',
  'Scientific Aims': '',
  'Planned T/O Time': '',
  'Departure Airport': '',
  'Landing Airport': '',
  'FIRS / Zones': '',
  'Weather Conditions': '',
  'Instrument Servicability': '',
  'Special Notes ': '',
  },
  highlightedRoutines: [],
  highlightedWaypoints: [],
};

export const sortieSlice = createSlice({
  name: 'Sortie',
  initialState,
  reducers: {
    updateFlightPlan: (state, flightPlan: PayloadAction<RoutineSequence>) => {
      state.flightPlan = flightPlan.payload;
    },
    updateWaypoints: (state, waypoints: PayloadAction<Waypoint[]>) => {
      state.waypoints = waypoints.payload;
    },
    updateHighlightedRoutines: (state, routines: PayloadAction<string[]>) => {
      state.highlightedRoutines = routines.payload;
    },
    updateHighlightedWaypoints: (state, waypoints: PayloadAction<string[]>) => {
      state.highlightedWaypoints = waypoints.payload;
    },
  },
});

export const {
  updateFlightPlan,
  updateWaypoints,
  updateHighlightedRoutines,
  updateHighlightedWaypoints,
} = sortieSlice.actions;

export const selectFlightPlan = (state: RootState): RoutineSequence =>
  state.sortie.flightPlan;
export const selectWaypoints = (state: RootState): Waypoint[] =>
  state.sortie.waypoints;
export const selectHighlightedRoutines = (state: RootState): string[] =>
  state.sortie.highlightedRoutines;
export const selectHighlightedWaypoints = (state: RootState): string[] =>
  state.sortie.highlightedWaypoints;
export const selectActiveWaypoints = (state: RootState): string [] => {
  const ids: string[] = [];
  state.sortie.flightPlan.forEach((fp) => {
    if (fp.waypoint0) ids.push(fp.waypoint0);
    if (fp.waypoint1) ids.push(fp.waypoint1);
  });
  return [...new Set(ids)];
}
export default sortieSlice.reducer;
