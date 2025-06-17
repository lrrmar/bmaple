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
import FloatingBox from './features/FloatingBox';
import waypointReducer from './modules/waypoints/waypointSlice';
import bgsWmsReducer from './modules/bgs-wms/bgsWmsSlice';
import BGSWMSSource from './modules/bgs-wms/bgsWmsSource';
import BGSWMSProfile from './modules/bgs-wms/bgsWmsProfile';
import BGSWMSMenu from './modules/bgs-wms/bgsWmsMenu';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    bgsWms: bgsWmsReducer,
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
          <BGSWMSProfile />
        </Profiles>
        <Sources>
          <BGSWMSSource sourceIdentifier={'BGSWMS'} />
        </Sources>
        <BaseMaps>
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
        <FloatingBox>
          <BGSWMSMenu />
        </FloatingBox>
      </Map>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
