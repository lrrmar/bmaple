import React, { useEffect, useState } from 'react';
import { configureStore, PayloadAction } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer, { update } from './mapping/cacheSlice';
import capReducer from './modules/fasta/fastaCAP/capSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import './App.css';
import fastaReducer from './modules/fasta/fastaSlice';
import Slider from './modules/fasta/Slider';
import FastaProfile from './modules/fasta/FastaGraphic';
import FastaSource from './modules/fasta/FastaSource';
import FastaMainMenu from './modules/fasta/FastaMainMenu';
import FastaSourceLayer from './modules/fasta/FastaSourceLayer';
import CapLayer from './modules/fasta/fastaCAP/capLayer';
import BaseMaps from './mapping/BaseMaps';
import LightBaseMap from './mapping/LightBaseMap';
import DarkBaseMap from './mapping/DarkBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import FloatingBox from './features/FloatingBox';
import FoldOutMenu from './features/FoldOutMenu/FoldOutMenu';
import TimeScrollBar from './features/TimeScrollBar';
import ColourSchemeMenu from './modules/fasta/ColourSchemeMenu';
import ProductSelector from './modules/fasta/ProductSelector';
import CapWarningSource from './modules/fasta/fastaCAP/capWarningSource';

import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointSource from './modules/waypoints/WaypointSource';
import WaypointProfile from './modules/waypoints/WaypointProfile';
import LocationsList from './modules/fasta/LocationsList';
import CapProfile from './modules/fasta/fastaCAP/capProfile';
import CapPanel from './modules/fasta/fastaCAP/capPanel';
import CollapseColourBar from './modules/fasta/fastaCAP/collapsibleMenu';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    fasta: fastaReducer,
    waypoint: waypointReducer,
    cap: capReducer,
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

const floatingBoxStyle = {
  top: '20px',
  right: '20px',
  borderColor: 'black',
  borderWidth: '2px',
  borderStyle: 'solid',
  backgroundColor: 'rgba(255,255,255,0.8)',
};

const App = () => {
  useEffect(() => {
    sessionStorage.clear();
    document.title = 'FASTA';
  }, []);
  return (
    <div className="App">
      <Map>
        <Profiles>
          <FastaProfile />
          <WaypointProfile />
          <CapProfile />
        </Profiles>

        <Sources>
          <FastaSource cache={{}} sourceIdentifier={'fasta'} />
          <WaypointSource cache={{}} sourceIdentifier={'waypoint'} />

          <CapWarningSource cache={{}} sourceIdentifier={'cap'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
        <FloatingBox style={floatingBoxStyle}>
          <ColourSchemeMenu />
          {/* <ProductSelector /> */}
        </FloatingBox>
        <FoldOutMenu align="left">
          {/* <CapKeyPanel id="Caps Key"/> */}
          <CapPanel id="Caps" />
        </FoldOutMenu>
      </Map>

      <FastaMainMenu>
        <CollapseColourBar id="hello" />
        <Slider />
      </FastaMainMenu>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type Selector<T> = (state: RootState) => T;
export type Action<T> = (payload: T) => PayloadAction<T>;
export type AppDispatch = AppStore['dispatch'];
