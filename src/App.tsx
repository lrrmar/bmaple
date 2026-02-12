import React, { useEffect } from 'react';
import './App.css';
import { configureStore, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import mapReducer, {
  selectVerticalLevel,
  selectVerticalLevels,
  updateVerticalLevel,
} from './mapping/mapSlice';
import { Action } from 'redux';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import LightBaseMap from './mapping/LightBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';

import FloatingBox from './features/FloatingBox';
import ErrorMessage from './features/ErrorMessage';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TimeScrollBar from './features/TimeScrollBar';
import MultiUnitScrollBar from './features/MultiUnitScrollBar';

import regionsReducer from './modules/regions/regionsSlice';
import RegionsSource from './modules/regions/RegionsSource';
import RegionsProfile from './modules/regions/RegionsProfile';

import WaypointSource from './modules/sortie/WaypointSource';
import WaypointProfile from './modules/sortie/WaypointProfile';

import TrackSource from './modules/sortie/TrackSource';
import TrackProfile from './modules/sortie/TrackProfile';

import FlightPlan from './modules/sortie/components/FlightPlan';
import ClickModeMenu from './modules/sortie/components/ClickMode';
import sortieReducer from './modules/sortie/sortieSlice';
export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    regions: regionsReducer,
    sortie: sortieReducer,
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
      <div
        style={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
        }}
      >
        <div
          style={{
            width: '50%',
            height: '100vh',
            overflow: 'scroll',
          }}
        >
          <FlightPlan />
        </div>
        <div
          style={{
            width: '50%',
            height: '100vh',
          }}
        >
          <Map>
            <Profiles>
              <WaypointProfile sourceIdentifier={'waypoint'} />
              <TrackProfile sourceIdentifier={'track'} />
            </Profiles>
            <Sources>
              <WaypointSource sourceIdentifier={'waypoint'} />
              <TrackSource sourceIdentifier={'track'} />
            </Sources>
            <BaseMaps>
              <LightBaseMap id={'light'} />
              <OSMBaseMap id={'Open Street Map'} />
            </BaseMaps>
          </Map>
        </div>
      </div>
      <FloatingBox style={{ bottom: '20px', borderWidth: '0px' }}>
        <TimeScrollBar />
      </FloatingBox>
      <FloatingBox style={{ top: '20px', borderWidth: '0px' }}>
        <MultiUnitScrollBar
          selectValue={selectVerticalLevel}
          selectValues={selectVerticalLevels}
          updateValue={updateVerticalLevel}
          orientation={'vertical'}
        />
      </FloatingBox>
      <FloatingBox style={{ top: '20px', left: '50%' }}>
        <ErrorMessage />
      </FloatingBox>
      <FloatingBox style={{ bottom: '20px', left: '50%' }}>
        <ClickModeMenu
          modes={[
            { name: 'append SLR', icon: 'pencil' },
            { name: 'new waypoint', icon: 'pin' },
            { name: 'inspect', icon: 'mouse pointer' },
          ]}
        />
      </FloatingBox>
    </div>
  );
};

export default App;
export type ActionCreator<T> = (payload: T) => PayloadAction<T>;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export type Selector<T> = (state: RootState) => T;
