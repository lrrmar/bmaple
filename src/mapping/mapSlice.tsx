import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../App';
import View from 'ol/View';
import { fromLonLat, transformExtent } from 'ol/proj';
import OpenLayersMap from './OpenLayersMap';

export interface FeatureAtClick {
  ol_uid: string;
  geometry: string;
  [key: string]: string | number;
}

export const isFeatureAtClick = (x: any): x is FeatureAtClick => {
  return !!x && typeof x.ol_uid === 'string' && x.geometry === 'string';
};

const verticalLevelOrder = [
  'max',
  '2m',
  '10m',
  'p925',
  'p850',
  'p700',
  'p500',
  'p300',
  'p200',
  'total',
];

interface InitialState {
  center: number[] | null;
  zoom: number | null;
  extent: number[] | null;
  projection: string;
  units: string | null;
  displayTime: number;
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
  verticalLevel: string | null;
  verticalLevels: {
    [key: string]: string[];
  };
  verticalLevelUnits: string;
}

const initialState: InitialState = {
  center: [-3, 54],
  zoom: 5,
  extent: null,
  projection: 'force_nwr_projection',
  units: null,
  displayTime: 0,
  clickEvent: null,
  featuresAtClick: [],
  baseMaps: [],
  baseMapId: 'Open Street Map',
  themes: [],
  themeId: 'Plain',
  displayTimes: {},
  outlineContours: false,
  verticalLevel: null,
  verticalLevels: {},
  verticalLevelUnits: '',
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
      state.displayTime = displayTime.payload;
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
    updateVerticalLevel: (state, verticalLevel: PayloadAction<string>) => {
      state.verticalLevel = verticalLevel.payload;
    },
    updateVerticalLevels: (
      state,
      update: PayloadAction<{ source: string; levels: string[] }>,
    ) => {
      state.verticalLevels[update.payload.source] = update.payload.levels;
    },
    updateVerticalLevelUnits: (
      state,
      verticalLevelUnits: PayloadAction<string>,
    ) => {
      state.verticalLevelUnits = verticalLevelUnits.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateExtent.fulfilled, (state, action) => {
      const extent = action.payload;
      if (extent) state.extent = extent;
    });
  },
});

export const updateExtent = createAsyncThunk(
  'map/updateExtent',
  async (extent: number[], thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const currentExtent: number[] | null = state.map.extent;
    const changeExtent = (): boolean => {
      if (!extent) return false;
      if (extent.length != 4) return false;
      if (!currentExtent) return true;
      return currentExtent.every((val, i) => val === extent[i]);
    };
    if (changeExtent()) {
      const view = new View({
        zoom: 5,
        extent: extent,
        center: fromLonLat([
          extent[0] + (extent[2] - extent[0]) / 2,
          extent[1] + (extent[3] - extent[1]) / 2,
        ]),
      });
      const map = OpenLayersMap.map;
      map.setView(view);
      return extent;
    }
  },
);

export const {
  //updateDataLevels,
  //updateColourPalette,
  updateUnits,
  updateDisplayTime,
  updateClickEvent,
  updateFeaturesAtClick,
  updateBaseMaps,
  updateBaseMapId,
  updateThemes,
  updateThemeId,
  updateDisplayTimes,
  toggleOutlineContours,
  updateVerticalLevel,
  updateVerticalLevels,
  updateVerticalLevelUnits,
} = mapSlice.actions;

export const selectIsoDisplayTime = (state: RootState) => {
  const isoDisplayTime = new Date(state.map.displayTime).toISOString();
  const reducedIsoDisplayTime = isoDisplayTime.substring(
    0,
    isoDisplayTime.length - 2,
  );
  return reducedIsoDisplayTime.replace('.00', '');
};

export const selectCenter = (state: RootState) => state.map.center;
export const selectZoom = (state: RootState) => state.map.zoom;
export const selectExtent = (state: RootState) => state.map.extent;
export const selectProjection = (state: RootState) => state.map.projection;
export const selectDisplayTime = (state: RootState) => state.map.displayTime;
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
export const selectVerticalLevel = (state: RootState) =>
  state.map.verticalLevel;
export const selectVerticalLevels = (state: RootState) => {
  return state.map.verticalLevels;
  /*return verticalLevelOrder.filter((level) =>
    state.map.verticalLevels.includes(level),
  );*/
};
export const selectVerticalLevelUnits = (state: RootState) =>
  state.map.verticalLevelUnits;
export const selectDisplayTimesIntersection = (state: RootState) => {
  let times = Object.values(state.map.displayTimes)[0];
  if (times) {
    for (let i = 1; i < Object.keys(state.map.displayTimes).length; i++) {
      times = times.filter((time) =>
        Object.values(state.map.displayTimes)[i].includes(time),
      );
    }
  }
  return times;
};
export const selectVerticalLevelsIntersection = (state: RootState) => {
  const levelsArrays = Object.values(state.map.verticalLevels).filter(
    (arr) => arr.length > 1,
  );
  if (levelsArrays.length < 1) return [];
  // The line below gives us or first list of levels to create our total
  // intersection of all levels from AND gets them in the right order
  let levels = verticalLevelOrder.filter((level) =>
    levelsArrays[0].includes(level),
  );
  if (levels) {
    if (levelsArrays.length == 1) return levels; // No need for intersection
    for (let i = 1; i < levelsArrays.length; i++) {
      levels = levels.filter((level) =>
        Object.values(levelsArrays)[i].includes(level),
      );
    }
    return levels;
  }
  return [];
};
export default mapSlice.reducer;
