import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../App';

export interface FeatureAtClick {
  ol_uid: string;
  geometry: string;
  [key: string]: string | number;
}

export const isFeatureAtClick = (x: any): x is FeatureAtClick => {
  return !!x && typeof x.ol_uid === 'string' && x.geometry === 'string';
};

interface InitialState {
  center: number[] | null;
  zoom: number | null;
  units: string | null;
  displayTime: string;
  verticalLevel: string;
  clickEvent: { longitude: number; latitude: number } | null;
  featuresAtClick: FeatureAtClick[]; // Need to tackle the values / properties object from features to filter out undefined!
  baseMaps: string[];
  baseMapId: string;
  themes: string[];
  themeId: string;
  displayTimes: {
    [source: string]: number[];
  };
  outlineContours: boolean;
}

const initialState: InitialState = {
  center: [-3, 54],
  zoom: 5,
  units: null,
  displayTime: '',
  verticalLevel: '',
  clickEvent: null,
  featuresAtClick: [],
  baseMaps: [],
  baseMapId: 'Open Street Map',
  themes: [],
  themeId: 'Plain',
  displayTimes: {},
  outlineContours: false,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    ////Should these be handled in a separate slice e.g. dataSlice?
    //updateDataLevels: (state, levels: PayloadAction<any>) => {
    // state.dataLevels = levels.payload;
    //},
    //updateColourPalette: (state, palette: PayloadAction<any>) => {
    // state.colourPalette = palette.payload;
    //},
    updateUnits: (state, units: PayloadAction<string | null>) => {
      state.units = units.payload;
    },
    updateDisplayTime: (state, displayTime: PayloadAction<number>) => {
      const iso = new Date(displayTime.payload).toISOString();
      console.log(iso);
      const reducedIso = iso.substring(0, iso.length - 2);
      console.log(reducedIso);
      state.displayTime = iso;
    },
    updateVerticalLevel: (state, verticalLevel: PayloadAction<string>) => {
      state.verticalLevel = verticalLevel.payload;
    },
    updateClickEvent: (
      state,
      click: PayloadAction<{ longitude: number; latitude: number } | null>,
    ) => {
      state.clickEvent = click.payload;
    },
    updateFeaturesAtClick: (
      state,
      features: PayloadAction<FeatureAtClick[]>,
    ) => {
      state.featuresAtClick = features.payload;
    },
    updateBaseMaps: (state, baseMaps: PayloadAction<string[]>) => {
      state.baseMaps = baseMaps.payload;
    },
    updateBaseMapId: (state, baseMapId: PayloadAction<string>) => {
      state.baseMapId = baseMapId.payload;
    },
    updateThemes: (state, themes: PayloadAction<string[]>) => {
      state.themes = themes.payload;
    },
    updateThemeId: (state, themeId: PayloadAction<string>) => {
      state.themeId = themeId.payload;
    },
    updateDisplayTimes: (
      state,
      update: PayloadAction<{ source: string; times: number[] }>,
    ) => {
      state.displayTimes[update.payload.source] = update.payload.times;
    },
    toggleOutlineContours: (state) => {
      state.outlineContours = !state.outlineContours;
    },
  },
});

export const {
  //updateDataLevels,
  //updateColourPalette,
  updateUnits,
  updateDisplayTime,
  updateVerticalLevel,
  updateClickEvent,
  updateFeaturesAtClick,
  updateBaseMaps,
  updateBaseMapId,
  updateThemes,
  updateThemeId,
  updateDisplayTimes,
  toggleOutlineContours,
} = mapSlice.actions;

export const selectCenter = (state: RootState) => state.map.center;
export const selectZoom = (state: RootState) => state.map.zoom;
export const selectDisplayTime = (state: RootState) => state.map.displayTime;
export const selectVerticalLevel = (state: RootState) =>
  state.map.verticalLevel;
export const selectUnits = (state: RootState) => state.map.units;
//export const selectColourPalette = (state: RootState) => {
//  return null;
//};
export const selectClickEvent = (state: RootState) => state.map.clickEvent;
export const selectFeaturesAtClick = (state: RootState) =>
  state.map.featuresAtClick;
export const selectBaseMaps = (state: RootState) => state.map.baseMaps;
export const selectBaseMapId = (state: RootState) => state.map.baseMapId;
export const selectThemes = (state: RootState) => state.map.themes;
export const selectThemeId = (state: RootState) => state.map.themeId;
export const selectMenuStyle = (state: RootState) =>
  state.map.themeId + ' ' + state.map.baseMapId;
export const selectDisplayTimes = (state: RootState) => state.map.displayTimes;
export const selectOutlineContours = (state: RootState) =>
  state.map.outlineContours;
export default mapSlice.reducer;
