import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../App';
import type { HashTable } from './../FastaHashTables';
import { Root } from 'react-dom/client';
import { StringLiteral } from 'typescript';

interface InitialState{
    url: string| null;
    capID: number | null;
    event: string | null;
    severity: string | null;
    startTime: string | null;
    endTime: string | null;
    country: string | null;
}

const initialState: InitialState = {
    url: null,
    capID: null,
    event: null,
    severity: null,  
    startTime: null,
    endTime: null, 
    country: null
}

export const capSlice = createSlice({
    name: 'cap',
    initialState, 
    reducers: {
        updateUrl(state, newUrl:PayloadAction<string>){
            state.url = newUrl.payload;
        },
        updateCapID(state, newID:PayloadAction<number>){
            state.capID = newID.payload;
        },
        updateEvent(state, event: PayloadAction<string>){
            state.event = event.payload;
        },
        updateSeverity(state, severity: PayloadAction<string>){
            state.severity = severity.payload;
        },
        updateEndTime(state, endTime: PayloadAction<string>){
            state.endTime = endTime.payload;
        },
        updateStartTime(state, startTime: PayloadAction<string>){
            state.startTime = startTime.payload;
        },
        updateCountry(state, country:PayloadAction<string>){
            state.country = country.payload;
        }
    },
});

export const {
    updateUrl,
    updateCapID,
    updateCountry,
    updateEvent,
    updateSeverity, 
    updateEndTime,
    updateStartTime

} = capSlice.actions

export const selectUrl = (state: RootState) => state.cap.url;
export const selectCapID = (state: RootState) => state.cap.capID;
export const selectCountry = (state: RootState) => state.cap.country;
export const selectEvent = (state: RootState) => state.cap.event;
export const selectSeverity = (state: RootState) => state.cap.severity;
export const selectEndTime = (state: RootState) => state.cap.endTime;
export const selectStartTime = (state: RootState) => state.cap.startTime;

export default capSlice.reducer;