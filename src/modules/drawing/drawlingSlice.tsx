import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../App';
import {
    Entry as CacheEntry,
    Pending as CachePending,
    CacheElement,
} from '../../mapping/cacheSlice';

interface InitialState {
    isDrawing: boolean,
    name: string,
    layerID: string,
    oluids: string[],
    mode: 'Polygon' | 'LineString';
    freehand: boolean,
    isEraser: boolean,
}

const initialState: InitialState = {
    isDrawing: true,
    name: 'Default',
    layerID: '',
    oluids: [],
    mode: 'Polygon',
    freehand: true,
    isEraser: false,
};

export const drawingSlice = createSlice({
    name: 'draw',
    initialState,
    reducers: {
        updateIsDrawing(state, drawing: PayloadAction<boolean>){
            state.isDrawing = drawing.payload;
        },
        updateName(state, name: PayloadAction<string>) {
            state.name = name.payload;
        },
        updateLayerID(state, layerID: PayloadAction<string> ) { 
            state.layerID = layerID.payload;
        },    
        updateOluidList(state, oluids: PayloadAction<string[]>) {
        state.oluids = oluids.payload;
        },
        updateMode (state, mode: PayloadAction<'Polygon' | 'LineString'>) {
            state.mode = mode.payload;
        },
        updateFreehand(state, freehand: PayloadAction<boolean>) {
            state.freehand = freehand.payload;
        },
        updateIsEraser( state, erase:PayloadAction<boolean>) { 
            state.isEraser = erase.payload
        },
    }
})

export const {
    updateIsDrawing,
    updateName,
    updateLayerID, 
    updateOluidList,
    updateMode,
    updateFreehand,
    updateIsEraser,
} = drawingSlice.actions

export const selectIsDrawing = (state:RootState) => state.draw.isDrawing;
export const selectName = (state: RootState) => state.draw.name;
export const selectLayerID = (state: RootState) => state.draw.layerID;
export const selectOluids = (state: RootState) => state.draw.oluids;
export const selectMode = (state: RootState) => state.draw.mode;
export const selectFreehand = (state:RootState) => state.draw.freehand;
export const selectEraser = (state: RootState) => state.draw.isEraser;

export default drawingSlice.reducer;
