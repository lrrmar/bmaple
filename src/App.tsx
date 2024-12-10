import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import TileLayer from './mapping/TileLayer';
import './App.css';
import fastaReducer from './modules/fasta/fastaSlice';
import Slider from './modules/fasta/Slider';
import FastaProfile from './modules/fasta/FastaGraphic';
import FastaSource from './modules/fasta/FastaSource';
import FastaMainMenu from './modules/fasta/FastaMainMenu';
import FastaSourceLayer from './modules/fasta/FastaSourceLayer';



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

interface SourceProps {
  sourceIdentifier: string;
  cache?: number;
}


const App = () => {
  useEffect(() => {
    sessionStorage.clear();
  }, []);
  return (
    <div className="App">
      <Map>
        <Profiles>
          <FastaProfile/>
        </Profiles>
        <Sources>
          <FastaSource cache={{}} sourceIdentifier={'fasta'} />
        </Sources>
        <TileLayer />
      </Map>
      <FastaMainMenu>
        <Slider />
      </FastaMainMenu>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
