import React, { useEffect } from 'react';
import { configureStore, PayloadAction, ThunkAction } from '@reduxjs/toolkit';

import mapReducer, {
  selectVerticalLevels,
  updateVerticalLevel,
} from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import DarkBaseMap from './mapping/DarkBaseMap';
import SwissTopoBaseMap from './mapping/SwissTopoBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import Themes from './mapping/Themes';
import ResizableDiv from './features/ResizableDiv';
import GlassTabletTheme from './mapping/GlassTabletTheme';
import PlainTheme from './mapping/PlainTheme';
import forceNwrReducer from './modules/force-nwr/forceNwrSlice';
import ForceNwrSource from './modules/force-nwr/ForceNwrSource';
import ForceNwrProfile from './modules/force-nwr/ForceNwrProfile';
import ForceNwrMenu from './modules/force-nwr/ForceNwrMenu';
import waypointReducer from './modules/waypoints/waypointSlice';
import geojsonFieldReducer from './modules/force-geojson-field/geojsonFieldSlice';
import WaypointsSource from './modules/waypoints/WaypointSource';
//import FlightTrackSource from './modules/flight-paths/FlightTrackSource';
//import FlightTrackMenu from './modules/flight-paths/FlightTrackMenu';
import TimeVerticalSensitiveWaypointsProfile from './modules/waypoints/TimeVerticalSensitiveWaypointProfile';
import FloatingBox from './features/FloatingBox';
import ImgViewPort from './features/ImgViewPort';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
//import TempBaseMapMenu from './features/TempBaseMapMenu';
import TimeScrollBar from './features/TimeScrollBar';
import MetaDataMenu from './features/MetaDataMenu';
import MultiUnitScrollBar from './features/MultiUnitScrollBar';
import Tiles from './features/Tiles';
import './App.css';

// Configure the reducers that will be used in the app

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    forceNwr: forceNwrReducer,
    waypoint: waypointReducer,
    geojsonField: geojsonFieldReducer,
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
          <ForceNwrProfile />
          <TimeVerticalSensitiveWaypointsProfile />
        </Profiles>
        <Sources>
          <ForceNwrSource sourceIdentifier={'123'} />
          {/*<FlightTrackSource cache={{}} sourceIdentifier={'flight'} />*/}
        </Sources>
        <BaseMaps></BaseMaps>
      </Map>
      <div
        style={{
          position: 'absolute',
          left: '12vw',
          top: '12vh',
          width: '76vw',
          height: '76vh',
          zIndex: '20',
          display: 'flex',
          alignItems: 'centre',
        }}
      >
        <Tiles />
      </div>
      <FloatingBox style={{ bottom: '20px', borderWidth: '0px', zIndex: '21' }}>
        <TimeScrollBar />
      </FloatingBox>
      <FloatingBox style={{ top: '20px', borderWidth: '0px' }}>
        <MultiUnitScrollBar
          selectValues={selectVerticalLevels}
          updateValue={updateVerticalLevel}
          orientation={'vertical'}
        />
      </FloatingBox>
      {/*<FoldOutMenu align={'left'} theme={'glassTablet'}>
        {/*<FoldOutItem id={'Style'} icon={'paint brush'}>
          <TempBaseMapMenu id={'Style'} icon={'paint brush'} />
        </FoldOutItem>*/}
      {/*<FoldOutItem id={'Flight'} icon={'paper plane outline'}>
          <FlightTrackMenu />
        </FoldOutItem>*/}
      {/*<FoldOutItem id={'Waypoints'} icon={'map pin'}>
          <WaypointsMenu />
        </FoldOutItem>}
        <FoldOutItem id={'data'} icon={'image outline'}>
          <MetaDataMenu />
        </FoldOutItem>
        <FoldOutItem id={'style'} icon={'paint brush'}>
          <ForceNwrMenu />
        </FoldOutItem>
        <FoldOutItem id={'example'} icon={'question mark'}>
          {'I am an example'}
        </FoldOutItem>
      </FoldOutMenu>*/}
      <Themes>
        <GlassTabletTheme id={'glassTablet'} />
        <PlainTheme id={'Plain'} />
      </Themes>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type Selector<T> = (state: RootState) => T;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  PayloadAction<string>
>;
export type Action<T> = (payload: T) => PayloadAction<T>;
