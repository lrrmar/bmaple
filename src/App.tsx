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

import DateNavigationMenu from './modules/cumulus/DateNavigationMenu';
import Slider from './modules/cumulus/Slider';
import DropdownStartDate from './modules/cumulus/DropdownStartDate';
import DropdownAccumDays from './modules/cumulus/DropdownAccumDays';
import {
  DropdownSubseasonalModel,
  DropdownDownscalingModel,
  DropdownDatasetConfiguration,
  CatalogueStatus,
} from './modules/cumulus/DropdownModels';
import OpacitySlider from './modules/cumulus/OpacitySlider';
import PrecipitationLegend from './modules/cumulus/PrecipitationLegend';

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

        <div className="cumulus-controls-stack">
          <DateNavigationMenu>
            <CatalogueStatus />
            <DropdownSubseasonalModel></DropdownSubseasonalModel>
            <DropdownDownscalingModel></DropdownDownscalingModel>
            <DropdownStartDate></DropdownStartDate>
            <DropdownDatasetConfiguration />
            <DropdownAccumDays></DropdownAccumDays>
            <Slider></Slider>
            <OpacitySlider></OpacitySlider>
          </DateNavigationMenu>
        </div>

        <PrecipitationLegend />
      </Map>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
