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
  hashTables: { [key: string]: string | number };
}

const initialState: InitialState = {
  baseUrl: 'dev.fastaweather.com',
  selectedCrrId: null,
  selectedRdtId: null,
  profileCrrId: null,
  profileRdtId: null,
  hashTables: {},
};

export const fastaSlice = createSlice({
  name: 'fasta',
  initialState,
  reducers: {
    updateSelectedCrrId: (state, id: PayloadAction<string | null>) => {
      state.selectedCrrId = id.payload;
    },
    updateSelectedRdtId: (state, id: PayloadAction<string | null>) => {
      state.selectedRdtId = id.payload;
    },
    updateProfileCrrId: (state, id: PayloadAction<string | null>) => {
      state.profileCrrId = id.payload;
    },
    updateProfilRdtId: (state, id: PayloadAction<string | null>) => {
      state.profileRdtId = id.payload;
    },
  },
});

export const {
  updateSelectedCrrId,
  updateSelectedRdtId,
  updateProfileCrrId,
  updateProfileRdtId,
} = mapSlice.actions;

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
export default fastaSlice.reducer;
