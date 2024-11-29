import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';

interface InitialState {
  center: number[] | null;
  zoom: number | null;
  units: string | null;
  positioning: {
    time: string | null;
    verticalLevel: string | null;
  };
  clickEvent: { longitude: number; latitude: number } | null;
  featuresAtClick: ({ [key: string]: string } | undefined)[] | void[]; // Need to tackle the values / properties object from features to filter out undefined!
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
      features: PayloadAction<
        ({ [key: string]: string } | undefined)[] | void[]
      >,
    ) => {
      state.featuresAtClick = features.payload;
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
export default mapSlice.reducer;
