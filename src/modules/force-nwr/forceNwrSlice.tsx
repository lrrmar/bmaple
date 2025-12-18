import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';

export type DiscreteHeader = 'domain' | 'field' | 'start_time';
export interface BackendDiscreteMetaData {
  headers: DiscreteHeader[];
  values: { [key in DiscreteHeader]: string[] };
  tables: { [key in DiscreteHeader]: { [key: string]: (0 | 1)[][] } };
}
export interface DiscreteMetaData {
  [key: string]: string | null;
  domain: string | null;
  field: string | null;
  start_time: string | null;
}

export interface ContinuousMetaData {
  [key: string]: string | null;
  valid_time: string | null;
  level: string | null;
}

interface InitialState {
  selectedId: string | null;
  profileIds: { [key: string]: string | null };
  hashesFlag: number;
  opacity: number;
  apiUrl: string;
  startTime: string;
  level: number | null;
  levels: number[];
  levelUnits: string | null;
  discreteMetaDataSelections: { [key: string]: DiscreteMetaData | null };
  continuousMetaDataLocks: { [key: string]: ContinuousMetaData | null };
  backendDiscreteMetaData: BackendDiscreteMetaData | null;
  readableNames: { [key: string]: string } | null;
  setMapExtent: boolean;
  selectedResources: {
    [key: number]: string | null;
  };
}

let GEOJSON_API_URL: string | undefined | null = null;
GEOJSON_API_URL = process.env.GEOJSON_API_URL;
const apiUrl = GEOJSON_API_URL
  ? GEOJSON_API_URL
  : 'https://force.ncas.ac.uk/hash-table';
//const apiUrl = GEOJSON_API_URL ? GEOJSON_API_URL : 'http://localhost:8989';

const initialState: InitialState = {
  selectedId: null,
  profileIds: {},
  hashesFlag: 0,
  opacity: 1,
  apiUrl: apiUrl,
  startTime: '',
  level: null,
  levels: [],
  levelUnits: '',
  discreteMetaDataSelections: {},
  continuousMetaDataLocks: {},
  backendDiscreteMetaData: null,
  readableNames: null,
  setMapExtent: false,
  selectedResources: {},
};

export const forceNwrSlice = createSlice({
  name: 'forceNwr',
  initialState,
  reducers: {
    updateSelectedId: (state, id: PayloadAction<string | null>) => {
      state.selectedId = id.payload;
    },
    updateSelectedResources: (
      state,
      update: PayloadAction<{ viewId: number; resourceId: string | null }>,
    ) => {
      state.selectedResources[update.payload.viewId] =
        update.payload.resourceId;
    },
    updateProfileIds: (
      state,
      update: PayloadAction<{ host: string; resource: string | null }>,
    ) => {
      state.profileIds[update.payload.host] = update.payload.resource;
    },
    updateOpacity: (state, opacity: PayloadAction<number>) => {
      state.opacity = opacity.payload;
    },
    updateStartTime: (state, startTime: PayloadAction<string>) => {
      state.startTime = startTime.payload;
    },
    updateVerticalLevel: (state, level: PayloadAction<number>) => {
      state.level = level.payload;
    },
    updateVerticalLevels: (state, levels: PayloadAction<number[]>) => {
      state.levels = levels.payload;
      if (!state.level) state.level = levels.payload[0];
    },
    updateVerticalLevelUnits: (state, levelUnits: PayloadAction<string>) => {
      state.levelUnits = levelUnits.payload;
    },
    updateBackendDiscreteMetaData: (
      state,
      metadata: PayloadAction<BackendDiscreteMetaData>,
    ) => {
      state.backendDiscreteMetaData = metadata.payload;
    },
    updateReadableNames: (
      state,
      names: PayloadAction<{ [key: string]: string }>,
    ) => {
      state.readableNames = names.payload;
    },
    updateDiscreteMetaDataSelections: (
      state,
      selection: PayloadAction<{
        id: string;
        selection: DiscreteMetaData | null;
      }>,
    ) => {
      state.discreteMetaDataSelections[selection.payload.id] =
        selection.payload.selection;
    },
    updateContinuousMetaDataLocks: (
      state,
      locks: PayloadAction<{
        id: string;
        locks: ContinuousMetaData | null;
      }>,
    ) => {
      state.continuousMetaDataLocks[locks.payload.id] = locks.payload.locks;
    },
  },
});

export const {
  updateSelectedId,
  updateSelectedResources,
  updateProfileIds,
  updateOpacity,
  //updateField,
  updateStartTime,
  //updateRegion,
  updateVerticalLevel,
  updateVerticalLevels,
  updateVerticalLevelUnits,
  updateBackendDiscreteMetaData,
  updateReadableNames,
  updateDiscreteMetaDataSelections,
  updateContinuousMetaDataLocks,
} = forceNwrSlice.actions;

export const selectSelectedId = (state: RootState) => state.forceNwr.selectedId;
export const selectSelectedResources = (state: RootState) =>
  state.forceNwr.selectedResources;
export const selectProfileIds = (state: RootState) => state.forceNwr.profileIds;
export const selectOpacity = (state: RootState) => state.forceNwr.opacity;
export const selectApiUrl = (state: RootState) => state.forceNwr.apiUrl;
export const selectStartTime = (state: RootState) => state.forceNwr.startTime;
export const selectVerticalLevel = (state: RootState) => state.forceNwr.level;
export const selectVerticalLevels = (state: RootState) => state.forceNwr.levels;
export const selectVerticalLevelUnits = (state: RootState) =>
  state.forceNwr.levelUnits;
export const selectBackendDiscreteMetaData = (state: RootState) =>
  state.forceNwr.backendDiscreteMetaData;
export const selectReadableNames = (state: RootState) =>
  state.forceNwr.readableNames;
export const selectDiscreteMetaDataSelections = (state: RootState) =>
  state.forceNwr.discreteMetaDataSelections;
export const selectContinuousMetaDataLocks = (state: RootState) =>
  state.forceNwr.continuousMetaDataLocks;
export const selectSetMapExtent = (state: RootState) =>
  state.forceNwr.setMapExtent;
export default forceNwrSlice.reducer;
