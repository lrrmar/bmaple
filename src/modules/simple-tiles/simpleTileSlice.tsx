import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';

export type DiscreteHeader = 'file';
export interface BackendDiscreteMetaData {
  file: string[];
}
export interface DiscreteMetaData {
  [key: string]: string | null;
  file: string | null;
}

export interface ContinuousMetaData {
  [key: string]: string | null;
}

interface InitialState {
  selectedId: string | null;
  profileIds: { [key: string]: string | null };
  hashesFlag: number;
  opacity: number;
  strokeColour: string;
  strokeWidth: number;
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
  : 'https://staging.force.ncas.ac.uk/tile-server';
/*const apiUrl = GEOJSON_API_URL ? GEOJSON_API_URL : 'https://localhost:8989';*/

const initialState: InitialState = {
  selectedId: null,
  profileIds: {},
  hashesFlag: 0,
  opacity: 1,
  strokeColour: '#000000',
  strokeWidth: 0.5,
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

export const simpleTileSlice = createSlice({
  name: 'simpleTile',
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
    updateStrokeColour: (state, colour: PayloadAction<string>) => {
      state.strokeColour = colour.payload;
    },
    updateStrokeWidth: (state, width: PayloadAction<number>) => {
      state.strokeWidth = width.payload;
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
  updateStrokeColour,
  updateStrokeWidth,
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
} = simpleTileSlice.actions;

export const selectSelectedId = (state: RootState) =>
  state.simpleTile.selectedId;
export const selectSelectedResources = (state: RootState) =>
  state.simpleTile.selectedResources;
export const selectProfileIds = (state: RootState) =>
  state.simpleTile.profileIds;
export const selectOpacity = (state: RootState) => state.simpleTile.opacity;
export const selectStrokeColour = (state: RootState) =>
  state.simpleTile.strokeColour;
export const selectStrokeWidth = (state: RootState) =>
  state.simpleTile.strokeWidth;
export const selectApiUrl = (state: RootState) => state.simpleTile.apiUrl;
export const selectStartTime = (state: RootState) => state.simpleTile.startTime;
export const selectVerticalLevel = (state: RootState) => state.simpleTile.level;
export const selectVerticalLevels = (state: RootState) => [
  0, 1000, 2000, 3000, 4000, 5000, 8000, 12000, 20000, 30000,
]; // state.simpleTile.levels;
export const selectVerticalLevelUnits = (state: RootState) =>
  state.simpleTile.levelUnits;
export const selectBackendDiscreteMetaData = (state: RootState) =>
  state.simpleTile.backendDiscreteMetaData;
export const selectReadableNames = (state: RootState) =>
  state.simpleTile.readableNames;
export const selectDiscreteMetaDataSelections = (state: RootState) =>
  state.simpleTile.discreteMetaDataSelections;
export const selectContinuousMetaDataLocks = (state: RootState) =>
  state.simpleTile.continuousMetaDataLocks;
export const selectSetMapExtent = (state: RootState) =>
  state.simpleTile.setMapExtent;
export default simpleTileSlice.reducer;
