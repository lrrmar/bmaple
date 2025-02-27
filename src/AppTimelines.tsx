import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import './App.css';
import fastaReducer from './modules/fasta/fastaSlice';
import FastaProfile from './modules/fasta/FastaGraphic';
import FastaSource from './modules/fasta/FastaSource';
import FastaMainMenu from './modules/fasta/FastaMainMenu';
import FastaSourceLayer from './modules/fasta/FastaSourceLayer';
import BaseMaps from './mapping/BaseMaps';
import LightBaseMap from './mapping/LightBaseMap';
import DarkBaseMap from './mapping/DarkBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import FloatingBox from './features/FloatingBox';
import ProductSelector from './modules/fasta/ProductSelector';
import TimelineReport from './modules/fasta/TimelineReport';
import { color } from 'openlayers';

/*
export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    fasta: fastaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 100, // time in milliseconds
      },
    }),
});
*/

interface SourceProps {
  sourceIdentifier: string;
  cache?: number;
}

const floatingBoxStyle = { top: '20px', right: '20px',
  borderColor: 'black', borderWidth: '2px',
  borderStyle: 'solid', backgroundColor: 'rgba(255,255,255,0.8)'};

const pStyle = { color: '#000' };

const AppTimelines = () => {
  useEffect(() => {
    sessionStorage.clear();
    document.title = 'FASTA Timelines';
  }, []);
  return (
    <div className="App">
        <TimelineReport />
    </div>
  );
};

export default AppTimelines;
//export type AppStore = typeof store;
//export type RootState = ReturnType<AppStore['getState']>;
//export type AppDispatch = AppStore['dispatch'];
