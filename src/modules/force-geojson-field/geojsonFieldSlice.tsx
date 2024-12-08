import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import { useHashTables, HashTable } from './geojsonFieldHashTables';

interface InitialState {
  selectedId: string | null;
  profileId: string | null;
  hashesFlag: number;
}

const initialState: InitialState = {
  selectedId: null,
  profileId: null,
  hashesFlag: 0,
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
  },
});

export const { updateSelectedId, updateProfileId, updateHashesFlag } =
  geojsonFieldSlice.actions;

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
export default geojsonFieldSlice.reducer;
