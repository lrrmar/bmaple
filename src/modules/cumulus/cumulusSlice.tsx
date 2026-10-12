import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../App';
//import type { HashTable } from './CumulusHashTables';
import type { RunDatesByCombo } from './modelPaths';
import { Root } from 'react-dom/client';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedOnsetVariable: string | null;
  selectedDayOfYear: string | null; // start date
  selectedAccumDays: number | null; // accumulation period in days
  selectedEntry: string | null; // lead time in hours eg "024h"
  selectedSubseasonalModel: string | null; // eg "aurora-imerg", "ifs"
  selectedDownscalingModel: string | null; // eg "bilinear", "unet"
  runDatesByCombo: RunDatesByCombo | null; // discovered once from blob storage
  profileLayerId: string | null;
  //hashTables: HashTable[];
  //latestTimeslot: number | null; // latest as a unix timestamp
  //opacityCRR: number;
  chosenStyle: string;
}

const initialState: InitialState = {
  baseUrl:
    process.env.AZURE_CUMULUS_WEB_APP_ML_STORAGE_URL ??
    'https://cumulusappstorage.blob.core.windows.net/data/live_downscaled_png',
  token: '1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0',
  selectedOnsetVariable: 'precip_24h',
  selectedDayOfYear: '2026-10-07',
  selectedAccumDays: 1, // default accumulation period
  selectedEntry: '024h',
  selectedSubseasonalModel: 'aurora-imerg',
  selectedDownscalingModel: 'unet',
  runDatesByCombo: null,
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
    updateSelectedOnsetVariable: (state, id: PayloadAction<string | null>) => {
      state.selectedOnsetVariable = id.payload;
    },
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
    updateSelectedAccumDays: (state, id: PayloadAction<number | null>) => {
      state.selectedAccumDays = id.payload;
    },
    updateRunDatesByCombo: (state, dates: PayloadAction<RunDatesByCombo>) => {
      state.runDatesByCombo = dates.payload;
    },
    updateChosenStyle: (state, newStyle: PayloadAction<string>) => {
      state.chosenStyle = newStyle.payload;
    },
    updateSelectedSubseasonalModel: (
      state,
      model: PayloadAction<string | null>,
    ) => {
      state.selectedSubseasonalModel = model.payload;
    },
    updateSelectedDownscalingModel: (
      state,
      model: PayloadAction<string | null>,
    ) => {
      state.selectedDownscalingModel = model.payload;
    },
  },
});

export const {
  updateSelectedOnsetVariable,
  updateSelectedDayOfYear,
  updateSelectedAccumDays,
  updateSelectedEntry,
  //updateHashTables,
  updateProfileLayerId,
  updateChosenStyle,
  updateRunDatesByCombo,
  updateSelectedSubseasonalModel,
  updateSelectedDownscalingModel,
} = cumulusSlice.actions;

export const selectRunDatesByCombo = (state: RootState) =>
  state.cumulus.runDatesByCombo;
export const selectSelectedSubseasonalModel = (state: RootState) =>
  state.cumulus.selectedSubseasonalModel;
export const selectSelectedDownscalingModel = (state: RootState) =>
  state.cumulus.selectedDownscalingModel;

export const selectBaseUrl = (state: RootState) => state.cumulus.baseUrl;
export const selectToken = (state: RootState) => state.cumulus.token;
export const selectSelectedOnsetVariable = (state: RootState) =>
  state.cumulus.selectedOnsetVariable;
export const selectSelectedDayOfYear = (state: RootState) =>
  state.cumulus.selectedDayOfYear;
export const selectSelectedEntry = (state: RootState) =>
  state.cumulus.selectedEntry;
export const selectChosenStyle = (state: RootState) =>
  state.cumulus.chosenStyle;
export const selectSelectedAccumDays = (state: RootState) =>
  state.cumulus.selectedAccumDays;
export const selectProfileLayerId = (state: RootState) =>
  state.cumulus.profileLayerId;
//export const selectHashTables = (state: RootState) => state.cumulus.hashTables;

export default cumulusSlice.reducer;
