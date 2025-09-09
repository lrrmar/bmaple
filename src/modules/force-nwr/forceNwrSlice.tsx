import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';

export interface DiscreteMetaData {
  domain: string | null;
  field: string | null;
  start_time: string | null;
}

interface InitialState {
  selectedId: string | null;
  profileId: string | null;
  hashesFlag: number;
  opacity: number;
  apiUrl: string;
  startTime: string;
  level: number | null;
  levels: number[];
  levelUnits: string | null;
  discreteMetaDataSelections: DiscreteMetaData[];
  discreteMetaData: DiscreteMetaData;
  setMapExtent: boolean;
  selectedResources: {
    [key: number]: string | null;
  };
}

let GEOJSON_API_URL: string | undefined | null = null;
GEOJSON_API_URL = process.env.GEOJSON_API_URL;
//const apiUrl = GEOJSON_API_URL ? GEOJSON_API_URL : 'https://force-test.ddns.net/hash-table';
const apiUrl = GEOJSON_API_URL ? GEOJSON_API_URL : 'http://localhost:8989';

const initialState: InitialState = {
  selectedId: null,
  profileId: null,
  hashesFlag: 0,
  opacity: 1,
  apiUrl: apiUrl,
  startTime: '',
  level: null,
  levels: [],
  levelUnits: '',
  discreteMetaDataSelections: [],
  discreteMetaData: {
    domain: null,
    field: null,
    start_time: null,
  },
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
    updateProfileId: (state, id: PayloadAction<string | null>) => {
      state.profileId = id.payload;
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
    },
    updateVerticalLevelUnits: (state, levelUnits: PayloadAction<string>) => {
      state.levelUnits = levelUnits.payload;
    },
    updateDiscreteMetaData: (
      state,
      metadata: PayloadAction<DiscreteMetaData>,
    ) => {
      state.discreteMetaData = metadata.payload;
    },
  },
});

export const {
  updateSelectedId,
  updateSelectedResources,
  updateProfileId,
  updateOpacity,
  //updateField,
  updateStartTime,
  //updateRegion,
  updateVerticalLevel,
  updateVerticalLevels,
  updateVerticalLevelUnits,
  updateDiscreteMetaData,
} = forceNwrSlice.actions;

export const selectSelectedId = (state: RootState) => state.forceNwr.selectedId;
export const selectSelectedResources = (state: RootState) =>
  state.forceNwr.selectedResources;
export const selectProfileId = (state: RootState) => state.forceNwr.profileId;
export const selectOpacity = (state: RootState) => state.forceNwr.opacity;
export const selectApiUrl = (state: RootState) => state.forceNwr.apiUrl;
export const selectStartTime = (state: RootState) => state.forceNwr.startTime;
export const selectVerticalLevel = (state: RootState) => state.forceNwr.level;
export const selectVerticalLevels = (state: RootState) => state.forceNwr.levels;
export const selectVerticalLevelUnits = (state: RootState) =>
  state.forceNwr.levelUnits;
export const selectDiscreteMetaData = (state: RootState) =>
  state.forceNwr.discreteMetaData;
export const selectSetMapExtent = (state: RootState) =>
  state.forceNwr.setMapExtent;
export default forceNwrSlice.reducer;
