import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';

interface InitialState {
  layerNames: string[];
  currentLayerName: string | null;
  opacity: number;
  visible: boolean;
}
const initialState: InitialState = {
  layerNames: ['NATS Danger Areas'],
  currentLayerName: 'NATS Danger Areas',
  opacity: 1,
  visible: false,
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
    toggleVisible: (state) => {
      state.visible = !state.visible;
    },
  },
});

export const { updateCurrentLayerName, updateOpacity, toggleVisible } =
  regionsSlice.actions;

export const selectLayerNames = (state: RootState) => state.regions.layerNames;
export const selectCurrentLayerName = (state: RootState) =>
  state.regions.currentLayerName;
export const selectOpacity = (state: RootState) => state.regions.opacity;
export const selectVisible = (state: RootState) => state.regions.visible;
export default regionsSlice.reducer;
