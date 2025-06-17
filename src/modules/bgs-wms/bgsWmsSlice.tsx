import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';

interface InitialState {
  layerNames: string[];
  currentLayerName: string | null;
  opacity: number;
}
const initialState: InitialState = {
  layerNames: ['Bedrock', 'SBS', 'Linear Bedrock', 'Hard Substrate'],
  currentLayerName: 'Bedrock',
  opacity: 1,
};

export const bgsWmsSlice = createSlice({
  name: 'bgsWms',
  initialState,
  reducers: {
    updateCurrentLayerName: (state, id: PayloadAction<string | null>) => {
      state.currentLayerName = id.payload;
    },
    updateOpacity: (state, opacity: PayloadAction<number>) => {
      state.opacity = opacity.payload;
    },
  },
});

export const { updateCurrentLayerName, updateOpacity } = bgsWmsSlice.actions;

export const selectLayerNames = (state: RootState) => state.bgsWms.layerNames;
export const selectCurrentLayerName = (state: RootState) =>
  state.bgsWms.currentLayerName;
export const selectOpacity = (state: RootState) => state.bgsWms.opacity;
export default bgsWmsSlice.reducer;
