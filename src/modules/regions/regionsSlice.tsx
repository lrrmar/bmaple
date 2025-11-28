import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';

interface InitialState {
  layerNames: string[];
  currentLayerName: string | null;
  opacity: number;
}
const initialState: InitialState = {
  layerNames: ['NATS Danger Areas'],
  currentLayerName: 'NATS Danger Areas',
  opacity: 1,
};

export const regionsSlice = createSlice({
  name: 'Regions',
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

export const { updateCurrentLayerName, updateOpacity } = regionsSlice.actions;

export const selectLayerNames = (state: RootState) => state.regions.layerNames;
export const selectCurrentLayerName = (state: RootState) =>
  state.regions.currentLayerName;
export const selectOpacity = (state: RootState) => state.regions.opacity;
export default regionsSlice.reducer;
