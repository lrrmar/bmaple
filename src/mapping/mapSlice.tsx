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
  positioning: {
    time: string;
    verticalLevel: string;
  };
  clickEvent: { longitude: number; latitude: number } | null;
  featuresAtClick: FeatureAtClick[]; // Need to tackle the values / properties object from features to filter out undefined!
  baseMaps: string[];
  baseMapId: string;
}

const initialState: InitialState = {
  center: [-3, 54],
  zoom: 5,
  units: null,
  positioning: {
    time: '',
    verticalLevel: '',
  },
  clickEvent: null,
  featuresAtClick: [],
  baseMaps: [],
  baseMapId: 'OSM',
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
    updatePositioning: (
      state,
      positioning: PayloadAction<{ time: string; verticalLevel: string }>,
    ) => {
      state.positioning = positioning.payload;
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
  },
});

export const {
  //updateDataLevels,
  //updateColourPalette,
  updateUnits,
  updatePositioning,
  updateClickEvent,
  updateFeaturesAtClick,
  updateBaseMaps,
  updateBaseMapId,
} = mapSlice.actions;

export const selectCenter = (state: RootState) => state.map.center;
export const selectZoom = (state: RootState) => state.map.zoom;
export const selectPositioning = (state: RootState) => state.map.positioning;
export const selectUnits = (state: RootState) => state.map.units;
//export const selectColourPalette = (state: RootState) => {
//  return null;
//};
export const selectClickEvent = (state: RootState) => state.map.clickEvent;
export const selectFeaturesAtClick = (state: RootState) =>
  state.map.featuresAtClick;
export const selectBaseMaps = (state: RootState) => state.map.baseMaps;
export const selectBaseMapId = (state: RootState) => state.map.baseMapId;
export default mapSlice.reducer;
