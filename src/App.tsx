import React, { useEffect } from 'react';
import { configureStore, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import mapReducer from './mapping/mapSlice';
import { Action } from 'redux';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import LightBaseMap from './mapping/LightBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import Themes from './mapping/Themes';
import geojsonFieldReducer, {
  selectVerticalLevels,
  selectVerticalLevelUnits,
  updateVerticalLevel,
} from './modules/force-geojson-field/geojsonFieldSlice';
import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointsSource from './modules/waypoints/WaypointSource';
import WaypointsMenu from './modules/waypoints/WaypointsMenu';
import trajectoriesReducer from './modules/trajectories/trajectoriesSlice';
import TrajectoriesSource from './modules/trajectories/TrajectoriesSource';
import TrajectoriesMenu from './modules/trajectories/TrajectoriesMenu';
import timeseriesReducer from './modules/timeseries/timeseriesSlice';
import TimeVerticalSensitiveWaypointsProfile from './modules/waypoints/TimeVerticalSensitiveWaypointProfile';
import TimeVerticalSensitiveTrajectoryProfile from './modules/trajectories/TimeVerticalSensitiveTrajectoryProfile';
import Info from './modules/info/Info';
import FloatingBox from './features/FloatingBox';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TimeScrollBar from './features/TimeScrollBar';
import ScrollBar from './features/ScrollBar';
import './App.css';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    geojsonField: geojsonFieldReducer,
    waypoint: waypointReducer,
    timeseries: timeseriesReducer,
    trajectories: trajectoriesReducer,
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
          <TimeVerticalSensitiveWaypointsProfile />
          <TimeVerticalSensitiveTrajectoryProfile />
        </Profiles>
        <Sources>
          <WaypointsSource cache={{}} sourceIdentifier={'waypoints'} />
          <TrajectoriesSource cache={{}} sourceIdentifier={'trajectories'} />
        </Sources>
        <BaseMaps>
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'Open Street Map'} />
        </BaseMaps>
      </Map>
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
        <FoldOutItem id={'Info'} icon={'info'}>
          <Info />
        </FoldOutItem>
        <FoldOutItem id={'Waypoints'} icon={'map marker alternate'}>
          <WaypointsMenu />
        </FoldOutItem>
        <FoldOutItem id={'Trajectories'} icon={'share alternate'}>
          <TrajectoriesMenu />
        </FoldOutItem>
      </FoldOutMenu>
      <Themes></Themes>
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
