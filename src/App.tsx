import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer, { mapSlice } from './mapping/mapSlice';
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

import cumulusReducer from './modules/cumulus/cumulusSlice';
import CumulusProfile from './modules/cumulus/CumulusGraphic';
import CumulusSource from './modules/cumulus/CumulusSource';

import PopUpListener from './modules/cumulus/PopUpListener';

import DateNavigationMenu from './modules/cumulus/DateNavigationMenu';
import Slider from './modules/cumulus/Slider';
import DropdownStartDate from './modules/cumulus/DropdownStartDate';
import OnsetVariableSelector from './modules/cumulus/OnsetVariableSelector';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cumulus: cumulusReducer,
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
          <CumulusProfile />
          <WaypointProfile />
        </Profiles>
        <Sources>
          <CumulusSource cache={{}} sourceIdentifier={'cumulus'} />
        </Sources>

        <BaseMaps>
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>

        <OnsetVariableSelector />

        <PopUpListener cache={{}} sourceIdentifier={'cumulus'} />

        <DateNavigationMenu>
          <DropdownStartDate></DropdownStartDate>
          <Slider></Slider>
        </DateNavigationMenu>
      </Map>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
