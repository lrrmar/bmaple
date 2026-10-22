import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../App';
//import type { HashTable } from './CumulusHashTables';
import type { RunDatesByCombo } from './modelPaths';
import {
  addHours,
  clampLeadHours,
  formatLeadEntry,
  hoursBetween,
  isDateString,
  minLeadHours,
  parseLeadHours,
} from './forecastDates';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedOnsetVariable: string | null;
  selectedDayOfYear: string | null; // start date
  selectedForecastDate: string | null; // run date + lead time
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
  overlayOpacity: number; // 0 to 1
}

const initialState: InitialState = {
  baseUrl:
    process.env.AZURE_CUMULUS_WEB_APP_ML_STORAGE_URL ??
    'https://cumulusappstorage.blob.core.windows.net/data',
  token: '1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0',
  selectedOnsetVariable: 'precip_24h',
  selectedDayOfYear: '2026-10-07',
  selectedForecastDate: '2026-10-08',
  selectedAccumDays: 1, // default accumulation period
  selectedEntry: '0024h',
  selectedSubseasonalModel: 'aurora-imerg',
  selectedDownscalingModel: 'unet',
  runDatesByCombo: null,
  profileLayerId: null,
  //profileCrrId: null,
  //hashTables: [],
  //latestTimeslot: null,
  //opacityCRR: 1,
  chosenStyle: 'rainbow',
  overlayOpacity: 0.75,
};

/* Derives lead time from run date and forecast date, clamping it to the valid
 * range for the accumulation period; clamping moves the forecast date. */
function applyForecastDate(state: InitialState, forecastDate: string | null) {
  const runDate = state.selectedDayOfYear;
  if (!isDateString(runDate)) {
    return;
  }
  const requested = isDateString(forecastDate)
    ? hoursBetween(runDate, forecastDate)
    : minLeadHours(state.selectedAccumDays);
  const lead = clampLeadHours(requested, state.selectedAccumDays);
  state.selectedEntry = formatLeadEntry(lead);
  state.selectedForecastDate = addHours(runDate, lead);
}

export const cumulusSlice = createSlice({
  name: 'cumulus',
  initialState,
  reducers: {
    updateSelectedOnsetVariable: (state, id: PayloadAction<string | null>) => {
      state.selectedOnsetVariable = id.payload;
    },
    // Changing the run date keeps the forecast date; the lead time follows
    updateSelectedDayOfYear: (state, id: PayloadAction<string | null>) => {
      state.selectedDayOfYear = id.payload;
      applyForecastDate(state, state.selectedForecastDate);
    },
    // Changing the lead time moves the forecast date
    updateSelectedEntry: (state, id: PayloadAction<string | null>) => {
      const hours = parseLeadHours(id.payload);
      if (hours === null || !isDateString(state.selectedDayOfYear)) {
        state.selectedEntry = id.payload;
        return;
      }
      applyForecastDate(state, addHours(state.selectedDayOfYear, hours));
    },
    //updateHashTables: (state, id: PayloadAction<HashTable[]>) => {
    //  state.hashTables = id.payload;
    //},
    updateProfileLayerId: (state, id: PayloadAction<string | null>) => {
      state.profileLayerId = id.payload;
    },
    updateSelectedAccumDays: (state, id: PayloadAction<number | null>) => {
      state.selectedAccumDays = id.payload;
      applyForecastDate(state, state.selectedForecastDate);
    },
    updateOverlayOpacity: (state, opacity: PayloadAction<number>) => {
      state.overlayOpacity = Math.min(1, Math.max(0, opacity.payload));
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
  updateOverlayOpacity,
  updateSelectedSubseasonalModel,
  updateSelectedDownscalingModel,
} = cumulusSlice.actions;

export const selectOverlayOpacity = (state: RootState) =>
  state.cumulus.overlayOpacity;
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
export const selectSelectedForecastDate = (state: RootState) =>
  state.cumulus.selectedForecastDate;
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
