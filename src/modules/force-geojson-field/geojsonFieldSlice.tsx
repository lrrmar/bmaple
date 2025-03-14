import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { useHashTables, HashTable } from './geojsonFieldHashTables';

interface InitialState {
  selectedId: string | null;
  profileId: string | null;
  hashesFlag: number;
  contours: { [key: string]: string };
  colourPaletteId: string;
  colourPalettes: string[];
  colourPalette: { [key: string]: string };
  units: string;
  opacity: number;
  apiUrl: string;
}

let GEOJSON_API_URL: string | undefined | null = null;
GEOJSON_API_URL = process.env.GEOJSON_API_URL;
console.log(window);
const apiUrl = GEOJSON_API_URL ? GEOJSON_API_URL : 'https://force-test.ddns.net/geojson';

const initialState: InitialState = {
  selectedId: null,
  profileId: null,
  hashesFlag: 0,
  contours: {},
  colourPaletteId: 'viridis',
  colourPalettes: [],
  colourPalette: {},
  units: '',
  opacity: 0.8,
  apiUrl: apiUrl,
};

export const geojsonFieldSlice = createSlice({
  name: 'geojsonField',
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
    updateContours: (
      state,
      contours: PayloadAction<{ [key: string]: string }>,
    ) => {
      state.contours = contours.payload;
    },
    updateColourPaletteId: (state, id: PayloadAction<string>) => {
      state.colourPaletteId = id.payload;
    },
    updateColourPalettes: (state, colourPalettes: PayloadAction<string[]>) => {
      state.colourPalettes = colourPalettes.payload;
    },
    updateColourPalette: (
      state,
      colourPalette: PayloadAction<{ [key: string]: string }>,
    ) => {
      state.colourPalette = colourPalette.payload;
    },
    updateUnits: (state, units: PayloadAction<string>) => {
      state.units = units.payload;
    },
    updateOpacity: (state, opacity: PayloadAction<number>) => {
      state.opacity = opacity.payload;
    },
  },
});

export const {
  updateSelectedId,
  updateProfileId,
  updateHashesFlag,
  updateContours,
  updateColourPaletteId,
  updateColourPalettes,
  updateColourPalette,
  updateUnits,
  updateOpacity,
} = geojsonFieldSlice.actions;

export const selectHashTables = createSelector(
  (state: RootState): RootState => state,
  (): HashTable[] => useHashTables(),
);
export const selectSelectedId = (state: RootState) =>
  state.geojsonField.selectedId;
export const selectProfileId = (state: RootState) =>
  state.geojsonField.profileId;
export const selectHashesFlag = (state: RootState) =>
  state.geojsonField.hashesFlag;
export const selectContours = (state: RootState) => state.geojsonField.contours;
export const selectColourPaletteId = (state: RootState) =>
  state.geojsonField.colourPaletteId;
export const selectColourPalettes = (state: RootState) =>
  state.geojsonField.colourPalettes;
export const selectColourPalette = (state: RootState) =>
  state.geojsonField.colourPalette;
export const selectUnits = (state: RootState) => state.geojsonField.units;
export const selectOpacity = (state: RootState) => state.geojsonField.opacity;
export const selectApiUrl = (state: RootState) => state.geojsonField.apiUrl;
export default geojsonFieldSlice.reducer;
