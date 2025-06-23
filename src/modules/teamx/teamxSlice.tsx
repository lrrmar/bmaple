import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { useHashTables, HashTable } from './teamxHashTables';

export interface DiscreteMetaData {
  run: string | null;
  region: string | null;
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
  discreteMetaData: DiscreteMetaData;
}

let GEOJSON_API_URL: string | undefined | null = null;
GEOJSON_API_URL = process.env.GEOJSON_API_URL;
const apiUrl = GEOJSON_API_URL ? GEOJSON_API_URL : 'http://localhost:8383';

const initialState: InitialState = {
  selectedId: null,
  profileId: null,
  hashesFlag: 0,
  opacity: 0.8,
  apiUrl: apiUrl,
  //  field: '',
  startTime: '',
  //region: '',
  level: null,
  levels: [],
  levelUnits: '',
  discreteMetaData: {
    run: null,
    region: null,
    field: null,
    start_time: null,
  },
};

export const teamxSlice = createSlice({
  name: 'teamx',
  initialState,
  reducers: {
    updateSelectedId: (state, id: PayloadAction<string | null>) => {
      state.selectedId = id.payload;
    },
    updateProfileId: (state, id: PayloadAction<string | null>) => {
      state.profileId = id.payload;
    },
    updateHashesFlag: (state) => {
      state.hashesFlag = state.hashesFlag + 1;
    },
    updateOpacity: (state, opacity: PayloadAction<number>) => {
      state.opacity = opacity.payload;
    },
    //updateField: (state, field: PayloadAction<string>) => {
    //state.field = field.payload;
    //},
    //updateRegion: (state, region: PayloadAction<string>) => {
    //state.region = region.payload;
    //},
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
  updateProfileId,
  updateHashesFlag,
  updateOpacity,
  //updateField,
  updateStartTime,
  //updateRegion,
  updateVerticalLevel,
  updateVerticalLevels,
  updateVerticalLevelUnits,
  updateDiscreteMetaData,
} = teamxSlice.actions;

export const selectHashTables = createSelector(
  (state: RootState): RootState => state,
  () => useHashTables(),
);
export const selectSelectedId = (state: RootState) => state.teamx.selectedId;
export const selectProfileId = (state: RootState) => state.teamx.profileId;
export const selectHashesFlag = (state: RootState) => state.teamx.hashesFlag;
export const selectOpacity = (state: RootState) => state.teamx.opacity;
export const selectApiUrl = (state: RootState) => state.teamx.apiUrl;
//export const selectField = (state: RootState) => state.teamx.field;
export const selectStartTime = (state: RootState) => state.teamx.startTime;
//export const selectRegion = (state: RootState) => state.teamx.region;
export const selectVerticalLevel = (state: RootState) => state.teamx.level;
export const selectVerticalLevels = (state: RootState) => state.teamx.levels;
export const selectVerticalLevelUnits = (state: RootState) =>
  state.teamx.levelUnits;
export const selectDiscreteMetaData = (state: RootState) =>
  state.teamx.discreteMetaData;
export default teamxSlice.reducer;
