// @ts-nocheck
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedCrrId: string | null;
  selectedRdtId: string | null;
  profileCrrId: string | null;
  profileRdtId: string | null;
  hashTables: [ { [key: string]: string | number } ];
  latestTimeslot: string | null;
}

const initialState: InitialState = {
  baseUrl: 'dev.fastaweather.com',
  selectedCrrId: null,
  selectedRdtId: null,
  profileCrrId: null,
  profileRdtId: null,
  hashTables: [],
  latestTimeslot: null,
};

export const fastaSlice = createSlice({
  name: 'fasta',
  initialState,
  reducers: {
    updateSelectedCrrId: (state, id: PayloadAction<string | null>) => {
      console.log("updateSelectedCrrId:" + id.payload);
      state.selectedCrrId = id.payload;
    },
    updateSelectedRdtId: (state, id: PayloadAction<string | null>) => {
      state.selectedRdtId = id.payload;
    },
    updateProfileCrrId: (state, id: PayloadAction<string | null>) => {
      console.log("updateProfileCrrId:" + id.payload);
      state.profileCrrId = id.payload;
    },
    updateProfileRdtId: (state, id: PayloadAction<string | null>) => {
      state.profileRdtId = id.payload;
    },
    updateHashTables: (state, id: PayloadAction<{ [key: string]: string | number }>) => {
      state.hashTables = id.payload;
    },
    updateLatestTimeslot: (state, timeslot: PayloadAction<string | null>) => {
      state.latestTimeslot = timeslot.payload;
    },
  },
});

export const {
  updateSelectedCrrId,
  updateSelectedRdtId,
  updateProfileCrrId,
  updateProfileRdtId,
  updateHashTables,
  updateLatestTimeslot,
} = fastaSlice.actions;

export const selectBaseUrl = (state: RootState) => state.fasta.baseUrl;
export const selectSelectedCrrId = (state: RootState) =>
  state.fasta.selectedCrrId;
export const selectSelectedRdtId = (state: RootState) =>
  state.fasta.selectedRdtId;
export const selectProfileCrrId = (state: RootState) =>
  state.fasta.profileCrrId;
export const selectProfileRdtId = (state: RootState) =>
  state.fasta.profileRdtId;
export const selectHashTables = (state: RootState) => state.fasta.hashTables;
export const selectLatestTimeslot = (state: RootState) => state.fasta.latestTimeslot;

export default fastaSlice.reducer;
