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
  hasTakeOff: boolean;
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
    primaryColor: '#03aa30',
    secondaryColor: '#9aaaef',
  },
  hasTakeOff: false,
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
    updateHasTakeOff: (state, hasTakeOff: PayloadAction<boolean>) => {
      state.hasTakeOff = hasTakeOff.payload;
    }
  },
});

export const {
  updateFlightPlan,
  updateWaypoints,
  updateHighlightedFeatures,
  updateHasTakeOff,
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
export const selectClickModes = (state: RootState) => {
  if (state.sortie.hasTakeOff) { 
    return [
      { name: 'takeoff', icon: 'arrow up' },
      { name: 'to waypoint', icon: 'pencil' },
      { name: 'new waypoint', icon: 'pin' },
      { name: 'inspect', icon: 'mouse pointer' },
    ];
  } else {
    return [
      { name: 'takeoff', icon: 'arrow up' },
      { name: 'to waypoint', icon: 'pencil' },
      { name: 'new waypoint', icon: 'pin' },
      { name: 'inspect', icon: 'mouse pointer' },
    ]
  }

}
export default sortieSlice.reducer;
