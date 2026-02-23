import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { type WaypointJson } from './lib/io/types';
import { type RoutineSequence } from './lib/io/types';

type AppStyle = {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
};

type SortieFormKey =
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
];

interface InitialState {
  flightPlan: RoutineSequence;
  waypoints: WaypointJson[];
  sortieForm: {
    [key: string]: string;
  };
  highlightedFeatures: string[];
  docxPrintFlag: number;
  appStyle: AppStyle;
}
const initialState: InitialState = {
  flightPlan: [],
  waypoints: [],
  sortieForm: {
    'Mission Scientist': '',
    Author: '',
    Approver: '',
    'Scientific Aims': '',
    'Planned T/O Time': '',
    'Departure Airport': '',
    'Landing Airport': '',
    'FIRS / Zones': '',
    'Weather Conditions': '',
    'Instrument Servicability': '',
    'Special Notes ': '',
  },
  highlightedFeatures: [],
  docxPrintFlag: 0,
  appStyle: {
    backgroundColor: 'rgba(255, 255, 255, 255)',
    primaryColor: '#252243',
    secondaryColor: '#0abbef',
  },
};

export const sortieSlice = createSlice({
  name: 'Sortie',
  initialState,
  reducers: {
    updateFlightPlan: (state, flightPlan: PayloadAction<RoutineSequence>) => {
      state.flightPlan = flightPlan.payload;
    },
    updateWaypoints: (state, waypoints: PayloadAction<WaypointJson[]>) => {
      state.waypoints = waypoints.payload;
    },
    updateHighlightedFeatures: (state, routines: PayloadAction<string[]>) => {
      state.highlightedFeatures = routines.payload;
    },
    flagDocxPrint: (state) => {
      state.docxPrintFlag += 1;
    },
  },
});

export const {
  updateFlightPlan,
  updateWaypoints,
  updateHighlightedFeatures,
  flagDocxPrint,
} = sortieSlice.actions;

export const selectFlightPlan = (state: RootState): RoutineSequence =>
  state.sortie.flightPlan;
export const selectWaypoints = (state: RootState): WaypointJson[] =>
  state.sortie.waypoints;
export const selectHighlightedFeatures = (state: RootState): string[] =>
  state.sortie.highlightedFeatures;
export const selectActiveWaypoints = (state: RootState): string[] => {
  const ids: string[] = [];
  state.sortie.flightPlan.forEach((fp) => {
    if (fp.waypoint0) ids.push(fp.waypoint0);
    if (fp.waypoint1) ids.push(fp.waypoint1);
  });
  return [...new Set(ids)];
};
export const selectDocxPrintFlag = (state: RootState): number => {
  return state.sortie.docxPrintFlag;
};
export const selectAppStyle = (state: RootState): AppStyle => {
  return state.sortie.appStyle;
};
export default sortieSlice.reducer;
