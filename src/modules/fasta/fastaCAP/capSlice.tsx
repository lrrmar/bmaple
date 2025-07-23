import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../App';
import type { HashTable } from './../FastaHashTables';
import { Root } from 'react-dom/client';
import { StringLiteral } from 'typescript';
import { defaultFillStyle } from 'ol/render/canvas';

interface InitialState{
    severity: string;
    country: string;
    opacity: number;
    style: string;
    countryList: string[];
}

const initialState: InitialState = {   
    severity: 'All',  
    country: 'All',
    opacity: 0.5,
    style: 'default',
    countryList: []
}

export const capSlice = createSlice({
    name: 'cap',
    initialState, 
    reducers: {
        updateOpacity(state, opacity:PayloadAction<number>){
            state.opacity = opacity.payload;
        },
        updateCountry(state, country:PayloadAction<string>){
            state.country = country.payload;
        },
        updateSeverity(state, severity:PayloadAction<string>){
            state.severity = severity.payload;
        },
        updateStyle(state, style:PayloadAction<string>){
            state.style = style.payload;
        },
        updateCountryList(state, country:PayloadAction<string[]>){
            state.countryList = country.payload;
        }
    },
});

export const {
    updateOpacity,
    updateCountry,
    updateSeverity, 
    updateStyle,
    updateCountryList
} = capSlice.actions

export const selectOpacity = (state:RootState) => state.cap.opacity;
export const selectCountry = (state: RootState) => state.cap.country;
export const selectSeverity = (state: RootState) => state.cap.severity;
export const selectStyle = (state: RootState) => state.cap.style;
export const selectCountryList = (state:RootState) => state.cap.countryList;

export default capSlice.reducer;