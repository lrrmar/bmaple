import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import OSMBaseMap from './mapping/OSMBaseMap';
import './App.css';

import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointSource from './modules/waypoints/WaypointSource';
import WaypointProfile from './modules/waypoints/WaypointProfile';
import WaypointApiCall from './modules/waypoints/WaypointApiCall';

import FloatingBox from './features/FloatingBox';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    waypoint: waypointReducer,
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
          <WaypointProfile />
        </Profiles>
        <Sources>
          <WaypointSource cache={{}} sourceIdentifier={'waypoint'} />
        </Sources>
        <BaseMaps>
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
      </Map>
      <FloatingBox>
        <WaypointApiCall />
      </FloatingBox>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
