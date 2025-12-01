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

export const faamPhysicsSlice = createSlice({
  name: 'FaamPhysics',
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

export const { updateCurrentLayerName, updateOpacity } =
  faamPhysicsSlice.actions;

export const selectLayerNames = (state: RootState) =>
  state.faamPhysics.layerNames;
export const selectCurrentLayerName = (state: RootState) =>
  state.faamPhysics.currentLayerName;
export const selectOpacity = (state: RootState) => state.faamPhysics.opacity;
export default faamPhysicsSlice.reducer;
