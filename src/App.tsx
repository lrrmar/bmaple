import React, { useEffect } from 'react';
import { configureStore, PayloadAction } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import DarkBaseMap from './mapping/DarkBaseMap';
import SwissTopoBaseMap from './mapping/SwissTopoBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import Themes from './mapping/Themes';
import GlassTabletTheme from './mapping/GlassTabletTheme';
import PlainTheme from './mapping/PlainTheme';
import geojsonFieldReducer, {
  selectVerticalLevels,
  selectVerticalLevelUnits,
  updateVerticalLevel,
} from './modules/force-geojson-field/geojsonFieldSlice';
import GeojsonFieldSource from './modules/force-geojson-field/GeojsonFieldSource';
import GeojsonFieldProfile from './modules/force-geojson-field/GeojsonFieldProfile';
import LayerSelector from './modules/force-geojson-field/LayerSelector';
import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointsSource from './modules/waypoints/WaypointSource';
import FlightTrackSource from './modules/flight-paths/FlightTrackSource';
import FlightTrackMenu from './modules/flight-paths/FlightTrackMenu';
import TimeVerticalSensitiveWaypointsProfile from './modules/waypoints/TimeVerticalSensitiveWaypointProfile';
import FloatingBox from './features/FloatingBox';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TempBaseMapMenu from './features/TempBaseMapMenu';
import ContourColourBar from './modules/force-geojson-field/contourColourBar/ContourColourBar';
import TimeScrollBar from './features/TimeScrollBar';
import Tester from './features/Tester';
import ScrollBar from './features/ScrollBar';
import './App.css';

// Configure the reducers that will be used in the app

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    geojsonField: geojsonFieldReducer,
    waypoint: waypointReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 100, // time in milliseconds
      },
    }),
});

// Configure the types that will be accepted by the cache

//export interface cacheSource =

const App = () => {
  useEffect(() => {
    sessionStorage.clear();
  }, []);
  return (
    <div className="App">
      <Map>
        <Profiles>
          <GeojsonFieldProfile />
          <TimeVerticalSensitiveWaypointsProfile />
        </Profiles>
        <Sources>
          <GeojsonFieldSource cache={{}} sourceIdentifier={'geojsonField'} />
          <WaypointsSource sourceIdentifier={'waypoints'} />
          <FlightTrackSource cache={{}} sourceIdentifier={'flight'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <OSMBaseMap id={'Open Street Map'} />
          <SwissTopoBaseMap id={'Swiss Topo'} />
        </BaseMaps>
      </Map>
      <FloatingBox
        minimise={''}
        style={{ top: '10px', flexDirection: 'column-reverse', width: 'auto' }}
      ></FloatingBox>
      <FloatingBox style={{ bottom: '130px', borderWidth: '0px' }}>
        <ContourColourBar />
      </FloatingBox>
      <FloatingBox style={{ bottom: '20px', borderWidth: '0px' }}>
        <TimeScrollBar />
      </FloatingBox>
      <FloatingBox style={{ top: '20px', borderWidth: '0px' }}>
        <ScrollBar
          selectValues={selectVerticalLevels}
          selectUnits={selectVerticalLevelUnits}
          updateValue={updateVerticalLevel}
          orientation={'vertical'}
        />
      </FloatingBox>
      <FoldOutMenu align={'left'} theme={'glassTablet'}>
        <FoldOutItem id={'Style'} icon={'paint brush'}>
          <TempBaseMapMenu id={'Style'} icon={'paint brush'} />
        </FoldOutItem>
        <FoldOutItem id={'Overlays'} icon={'images outline'}>
          <LayerSelector />
        </FoldOutItem>
        <FoldOutItem id={'Flight'} icon={'paper plane outline'}>
          <FlightTrackMenu />
        </FoldOutItem>
      </FoldOutMenu>
      <Themes>
        <GlassTabletTheme id={'glassTablet'} />
        <PlainTheme id={'Plain'} />
      </Themes>
      <Tester />
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type Selector<T> = (state: RootState) => T;
export type Action<T> = (payload: T) => PayloadAction<T>;
