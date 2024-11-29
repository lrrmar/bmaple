import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import TileLayer from './mapping/TileLayer';
import './App.css';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    //layerCache: layerCacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 100, // time in milliseconds
      },
    }),
});

const App = () => {
  useEffect(() => {
    sessionStorage.clear();
  }, []);
  return (
    <div className="App">
      <Map>
        <Profiles></Profiles>
        <Sources></Sources>
        <TileLayer />
      </Map>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
