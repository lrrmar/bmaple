import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import TileLayer from './mapping/TileLayer';
import geojsonFieldReducer from './modules/force-geojson-field/geojsonFieldSlice';
import GeojsonFieldSource from './modules/force-geojson-field/GeojsonFieldSource';
import GeojsonFieldProfile from './modules/force-geojson-field/GeojsonFieldProfile';
import './App.css';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    geojsonField: geojsonFieldReducer,
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
          <Profiles>
            <GeojsonFieldProfile sourceIdentifier={'geojsonField'} />
          </Profiles>
        <Sources>
          <GeojsonFieldSource cache={{}} sourceIdentifier={'geojsonField'} />
        </Sources>
        <TileLayer />
      </Map>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
