import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
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
import BaseMaps from './mapping/BaseMaps';
import LightBaseMap from './mapping/LightBaseMap';
import DarkBaseMap from './mapping/DarkBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import FloatingBox from './features/FloatingBox';
import FoldOutMenu from './features/FoldOutMenu/FoldOutMenu';
import ColourSchemeMenu from './modules/fasta/ColourSchemeMenu';
import ProductSelector from './modules/fasta/ProductSelector';

import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointSource from './modules/waypoints/WaypointSource';
import WaypointProfile from './modules/waypoints/WaypointProfile';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    fasta: fastaReducer,
    waypoint: waypointReducer,
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

const floatingBoxStyle = { top: '20px', right: '20px',
  borderColor: 'black', borderWidth: '2px',
  borderStyle: 'solid', backgroundColor: 'rgba(255,255,255,0.8)'};

const App = () => {
  useEffect(() => {
    sessionStorage.clear();
    document.title = 'FASTA';
  }, []);
  return (
    <div className="App">
      <Map>
        <Profiles>
          <FastaProfile/>
          <WaypointProfile/>
        </Profiles>
        <Sources>
          <FastaSource cache={{}} sourceIdentifier={'fasta'} />
          <WaypointSource cache={{}} sourceIdentifier={'waypoint'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
        <FloatingBox style={floatingBoxStyle}>
          <ProductSelector></ProductSelector>
        </FloatingBox>
        <FoldOutMenu align={'left'}>
          <ColourSchemeMenu id={'style'} />
        </FoldOutMenu>
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
