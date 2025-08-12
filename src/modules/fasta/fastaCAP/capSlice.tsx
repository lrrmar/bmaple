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
    desiredTime: number;
    countryList: string[];
    clicked: boolean;
    oluid: {[key:string] : string[]}; 
}

const initialState: InitialState = {   
    severity: 'All',  
    country: 'All',
    oluid: {'All' : ['123', '456']},
    opacity: 0,
    style: 'default',
    desiredTime: 0.5,
    countryList: [], 
    clicked: true,
}

export const capSlice = createSlice({
    name: 'cap',
    initialState, 
    reducers: {
        updateOluid( state, oluid:PayloadAction<{[key:string] : string[]}>){
            state.oluid = oluid.payload;
        },
        updateClick(state, clicked:PayloadAction<boolean>){
            state.clicked = clicked.payload;
        },
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
        updateDesiredTime( state, desTime:PayloadAction<number>){
            state.desiredTime = desTime.payload;
        },
        updateCountryList(state, country:PayloadAction<string[]>){
            state.countryList = country.payload;
        }
    },
});

export const {
    updateOluid,
    updateClick,
    updateOpacity,
    updateCountry,
    updateSeverity, 
    updateStyle,
    updateDesiredTime,
    updateCountryList
} = capSlice.actions

export const selectOluid = (state: RootState) => state.cap.oluid;
export const selectDesiredTime = (state: RootState) => state.cap.desiredTime;
export const selectOpacity = (state:RootState) => state.cap.opacity;
export const selectCountry = (state: RootState) => state.cap.country;
export const selectSeverity = (state: RootState) => state.cap.severity;
export const selectStyle = (state: RootState) => state.cap.style;
export const selectCountryList = (state:RootState) => state.cap.countryList;
export const selectClicked = (state:RootState) => state.cap.clicked;

export default capSlice.reducer;