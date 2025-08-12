import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import {
    Entry as CacheEntry,
    Pending as CachePending,
    CacheElement,
} from '../../mapping/cacheSlice';

interface InitialState {
    name: string,
    layerID: string,
    oluids: string[],
    mode: 'polygon' | 'freehand'
}

const initialState: InitialState = {
    name: 'Default',
    layerID: '',
    oluids: [],
    mode: 'freehand',
};

export const drawingSlice = createSlice({
    name: 'draw',
    initialState,
    reducers: {
        updateName(state, name: PayloadAction<string>) {
            state.name = name.payload;
        },
        updateLayerID(state, layerID: PayloadAction<string> ) { 
            state.layerID = layerID.payload;
        },    
        updateOluidList(state, oluids: PayloadAction<string[]>) {
        state.oluids = oluids.payload;
        },
        updateMode (state, mode: PayloadAction<'polygon' | 'freehand'>) {
            state.mode = mode.payload;
        },
    }
})

export const {
    updateName,
    updateLayerID, 
    updateOluidList,
    updateMode,
} = drawingSlice.actions

export const selectName = (state: RootState) => state.draw.name;
export const selectLayerID = (state: RootState) => state.draw.layerID;
export const selectOluids = (state: RootState) => state.draw.oluids;
export const selectMode = (state: RootState) => state.draw.mode;

export default drawingSlice.reducer;
