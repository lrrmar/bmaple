import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../App';
//import type { HashTable } from './CumulusHashTables';
import { Root } from 'react-dom/client';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedDayOfYear: string | null;
  selectedEntry: string | null;
  profileLayerId: string | null;
  //hashTables: HashTable[];
  //latestTimeslot: number | null; // latest as a unix timestamp
  //opacityCRR: number;
  chosenStyle: string;
}

const initialState: InitialState = {
  baseUrl: 'dev.fastaweather.com',
  token: '1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0',
  selectedDayOfYear: '2025/03/20',
  selectedEntry: '0',
  profileLayerId: null,
  //profileCrrId: null,
  //hashTables: [],
  //latestTimeslot: null,
  //opacityCRR: 1,
  chosenStyle: 'rainbow',
};

export const cumulusSlice = createSlice({
  name: 'cumulus',
  initialState,
  reducers: {
    updateSelectedDayOfYear: (state, id: PayloadAction<string | null>) => {
      state.selectedDayOfYear = id.payload;
    },
    updateSelectedEntry: (state, id: PayloadAction<string | null>) => {
      state.selectedEntry = id.payload;
    },
    //updateHashTables: (state, id: PayloadAction<HashTable[]>) => {
    //  state.hashTables = id.payload;
    //},
    updateProfileLayerId: (state, id: PayloadAction<string | null>) => {
      state.profileLayerId = id.payload;
    },
    updateChosenStyle: (state, newStyle: PayloadAction<string>) => {
      state.chosenStyle = newStyle.payload;
    },
  },
});

export const {
  updateSelectedDayOfYear,
  updateSelectedEntry,
  //updateHashTables,
  updateProfileLayerId,
  updateChosenStyle,
} = cumulusSlice.actions;

export const selectBaseUrl = (state: RootState) => state.cumulus.baseUrl;
export const selectToken = (state: RootState) => state.cumulus.token;
export const selectSelectedDayOfYear = (state: RootState) =>
  state.cumulus.selectedDayOfYear;
export const selectSelectedEntry = (state: RootState) =>
  state.cumulus.selectedEntry;
export const selectChosenStyle = (state: RootState) =>
  state.cumulus.chosenStyle;
export const selectProfileLayerId = (state: RootState) =>
  state.cumulus.profileLayerId;
//export const selectHashTables = (state: RootState) => state.cumulus.hashTables;

export default cumulusSlice.reducer;
