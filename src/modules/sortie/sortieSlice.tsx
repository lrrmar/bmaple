import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { WaypointType } from './lib/state/Waypoint';
import { type RoutineSequence } from './lib/io/JsonParser';

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
  waypoints: WaypointType[];
  sortieForm: {
    [key: string]: string;
  }
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
  }
};

export const sortieSlice = createSlice({
  name: 'Sortie',
  initialState,
  reducers: {
    updateFlightPlan: (state, flightPlan: PayloadAction<RoutineSequence>) => {
      state.flightPlan = flightPlan.payload;
    },
    updateWaypoints: (state, waypoints: PayloadAction<WaypointType[]>) => {
      state.waypoints = waypoints.payload;
    },
  },
});

export const { updateFlightPlan, updateWaypoints } = sortieSlice.actions;

export const selectFlightPlan = (state: RootState): RoutineSequence =>
  state.sortie.flightPlan;
export const selectWaypoints = (state: RootState): WaypointType[] =>
  state.sortie.waypoints;
export default sortieSlice.reducer;
