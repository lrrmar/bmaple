import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import type { RootState } from '../../App';

//import type { HashTable } from './CumulusHashTables';
import {
  Catalogue,
  availableRunDates,
  downscalingKey,
  fetchCatalogue,
  matchingProducts,
  subseasonalKey,
  unique,
} from './catalogue';
import {
  addHours,
  clampLeadHours,
  formatLeadEntry,
  hoursBetween,
  isDateString,
  minLeadHours,
  parseLeadHours,
  pickRunDate,
} from './forecastDates';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedModelRunDate: string | null; // start date
  selectedForecastDate: string | null; // run date + lead time
  selectedAccumDays: number | null; // accumulation period in days
  selectedLeadTime: string | null; // lead time in hours eg "024h"
  selectedSubseasonalModel: string | null; // eg "aurora-imerg", "ifs"
  selectedDownscalingModel: string | null; // eg "bilinear", "unet"
  selectedVariant: string | null;
  selectedCheckpoint: string | null;
  catalogue: Catalogue | null;
  catalogueStatus: 'idle' | 'loading' | 'ready' | 'error';
  catalogueError: string | null;
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
  selectedModelRunDate: null,
  selectedForecastDate: null,
  selectedAccumDays: 1, // default accumulation period
  selectedLeadTime: '0024h',
  selectedSubseasonalModel: 'aurora-imerg',
  selectedDownscalingModel: 'diffusion-mean',
  selectedVariant: null,
  selectedCheckpoint: null,
  catalogue: null,
  catalogueStatus: 'idle',
  catalogueError: null,
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
  const runDate = state.selectedModelRunDate;
  if (!isDateString(runDate)) {
    return;
  }
  const requested = isDateString(forecastDate)
    ? hoursBetween(runDate, forecastDate)
    : minLeadHours(state.selectedAccumDays);
  const lead = clampLeadHours(requested, state.selectedAccumDays);
  state.selectedLeadTime = formatLeadEntry(lead);
  state.selectedForecastDate = addHours(runDate, lead);
}

// Resolve dependent choices together so the map never sees a partial configuration.
function reconcileDataset(state: InitialState) {
  if (!state.catalogue) return;
  let candidates = state.catalogue.products;
  state.profileLayerId = null;
  if (candidates.length === 0) {
    state.selectedSubseasonalModel = null;
    state.selectedDownscalingModel = null;
    state.selectedVariant = null;
    state.selectedCheckpoint = null;
    state.selectedModelRunDate = null;
    return;
  }
  const models = unique(candidates.map(subseasonalKey)).sort();
  if (!models.includes(state.selectedSubseasonalModel ?? '')) {
    state.selectedSubseasonalModel = models[0];
  }
  candidates = candidates.filter(
    (product) => subseasonalKey(product) === state.selectedSubseasonalModel,
  );
  const downscaling = unique(candidates.map(downscalingKey)).sort();
  if (!downscaling.includes(state.selectedDownscalingModel)) {
    state.selectedDownscalingModel = downscaling[0];
  }
  candidates = candidates.filter(
    (product) => downscalingKey(product) === state.selectedDownscalingModel,
  );
  const dates = availableRunDates(candidates, state);
  if (
    !state.selectedModelRunDate ||
    !dates.includes(state.selectedModelRunDate)
  ) {
    state.selectedModelRunDate = isDateString(state.selectedForecastDate)
      ? pickRunDate(dates, state.selectedForecastDate, state.selectedAccumDays)
      : dates[0];
  }
  candidates = candidates.filter(
    (product) => product.run_date === state.selectedModelRunDate,
  );
  const variants = unique(candidates.map((product) => product.variant)).sort();
  if (!variants.includes(state.selectedVariant)) {
    state.selectedVariant = variants[0];
  }
  candidates = candidates.filter(
    (product) => product.variant === state.selectedVariant,
  );
  const checkpoints = unique(
    candidates.map((product) => product.checkpoint),
  ).sort();
  if (!checkpoints.includes(state.selectedCheckpoint)) {
    state.selectedCheckpoint = checkpoints[0];
  }
  applyForecastDate(state, state.selectedForecastDate);
}

export const loadCatalogue = createAsyncThunk<
  Catalogue,
  void,
  { state: RootState }
>(
  'cumulus/loadCatalogue',
  (_, { getState, signal }) =>
    fetchCatalogue(getState().cumulus.baseUrl, signal),
  {
    condition: (_, { getState }) =>
      getState().cumulus.catalogueStatus !== 'loading',
  },
);

export const cumulusSlice = createSlice({
  name: 'cumulus',
  initialState,
  reducers: {
    // Changing the run date keeps the forecast date; the lead time follows
    updateSelectedModelRunDate: (state, id: PayloadAction<string | null>) => {
      state.selectedModelRunDate = id.payload;
      if (state.catalogue) {
        reconcileDataset(state);
      } else {
        applyForecastDate(state, state.selectedForecastDate);
        state.profileLayerId = null;
      }
    },
    // Changing the lead time moves the forecast date
    updateSelectedLeadTime: (state, id: PayloadAction<string | null>) => {
      const hours = parseLeadHours(id.payload);
      if (hours === null || !isDateString(state.selectedModelRunDate)) {
        state.selectedLeadTime = id.payload;
        return;
      }
      applyForecastDate(state, addHours(state.selectedModelRunDate, hours));
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
    updateChosenStyle: (state, newStyle: PayloadAction<string>) => {
      state.chosenStyle = newStyle.payload;
    },
    updateSelectedSubseasonalModel: (
      state,
      model: PayloadAction<string | null>,
    ) => {
      state.selectedSubseasonalModel = model.payload;
      reconcileDataset(state);
    },
    updateSelectedDownscalingModel: (
      state,
      model: PayloadAction<string | null>,
    ) => {
      state.selectedDownscalingModel = model.payload;
      reconcileDataset(state);
    },
    updateSelectedVariant: (state, variant: PayloadAction<string | null>) => {
      state.selectedVariant = variant.payload;
      reconcileDataset(state);
    },
    updateSelectedCheckpoint: (
      state,
      checkpoint: PayloadAction<string | null>,
    ) => {
      state.selectedCheckpoint = checkpoint.payload;
      reconcileDataset(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalogue.pending, (state) => {
        state.catalogueStatus = 'loading';
        state.catalogueError = null;
      })
      .addCase(loadCatalogue.fulfilled, (state, action) => {
        state.catalogue = action.payload;
        state.catalogueStatus = 'ready';
        reconcileDataset(state);
      })
      .addCase(loadCatalogue.rejected, (state, action) => {
        state.catalogueStatus = 'error';
        state.catalogueError =
          action.error.message ?? 'Failed to load dataset catalogue';
        state.profileLayerId = null;
      });
  },
});

export const {
  updateSelectedModelRunDate,
  updateSelectedAccumDays,
  updateSelectedLeadTime,
  //updateHashTables,
  updateProfileLayerId,
  updateChosenStyle,
  updateOverlayOpacity,
  updateSelectedSubseasonalModel,
  updateSelectedDownscalingModel,
  updateSelectedVariant,
  updateSelectedCheckpoint,
} = cumulusSlice.actions;

export const selectOverlayOpacity = (state: RootState) =>
  state.cumulus.overlayOpacity;
export const selectCatalogue = (state: RootState) => state.cumulus.catalogue;
export const selectCatalogueStatus = (state: RootState) =>
  state.cumulus.catalogueStatus;
export const selectCatalogueError = (state: RootState) =>
  state.cumulus.catalogueError;
export const selectSelectedVariant = (state: RootState) =>
  state.cumulus.selectedVariant;
export const selectSelectedCheckpoint = (state: RootState) =>
  state.cumulus.selectedCheckpoint;
export const selectSelectedSubseasonalModel = (state: RootState) =>
  state.cumulus.selectedSubseasonalModel;
export const selectSelectedDownscalingModel = (state: RootState) =>
  state.cumulus.selectedDownscalingModel;

export const selectBaseUrl = (state: RootState) => state.cumulus.baseUrl;
export const selectToken = (state: RootState) => state.cumulus.token;
export const selectSelectedModelRunDate = (state: RootState) =>
  state.cumulus.selectedModelRunDate;
export const selectSelectedForecastDate = (state: RootState) =>
  state.cumulus.selectedForecastDate;
export const selectSelectedLeadTime = (state: RootState) =>
  state.cumulus.selectedLeadTime;
export const selectChosenStyle = (state: RootState) =>
  state.cumulus.chosenStyle;
export const selectSelectedAccumDays = (state: RootState) =>
  state.cumulus.selectedAccumDays;
export const selectProfileLayerId = (state: RootState) =>
  state.cumulus.profileLayerId;
export const selectAvailableRunDates = createSelector(
  [
    selectCatalogue,
    selectSelectedSubseasonalModel,
    selectSelectedDownscalingModel,
  ],
  (catalogue, selectedSubseasonalModel, selectedDownscalingModel) =>
    availableRunDates(catalogue?.products ?? [], {
      selectedSubseasonalModel,
      selectedDownscalingModel,
    }),
);
export const selectDatasetMatch = createSelector(
  [
    selectCatalogue,
    selectSelectedSubseasonalModel,
    selectSelectedDownscalingModel,
    selectSelectedVariant,
    selectSelectedCheckpoint,
    selectSelectedModelRunDate,
  ],
  (
    catalogue,
    selectedSubseasonalModel,
    selectedDownscalingModel,
    selectedVariant,
    selectedCheckpoint,
    runDate,
  ) => {
    const matches = matchingProducts(catalogue?.products ?? [], {
      selectedSubseasonalModel,
      selectedDownscalingModel,
      selectedVariant,
      selectedCheckpoint,
    }).filter((product) => product.run_date === runDate);
    return {
      product: matches.length === 1 ? matches[0] : null,
      error:
        matches.length > 1
          ? 'Multiple datasets match this selection. The catalogue needs an additional region or product distinction.'
          : null,
    };
  },
);
//export const selectHashTables = (state: RootState) => state.cumulus.hashTables;

export default cumulusSlice.reducer;
