import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { WaypointType } from './lib/Routine';
import { type RoutineSequence } from "./lib/JsonParser";
interface InitialState {
  flightPlan: RoutineSequence;
  waypoints: WaypointType[];
}
const initialState: InitialState = {
  flightPlan: [],
  waypoints: [],
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

export const selectFlightPlan = (state: RootState): RoutineSequence => state.sortie.flightPlan;
export const selectWaypoints = (state: RootState): WaypointType[] => state.sortie.waypoints;
export default sortieSlice.reducer;
