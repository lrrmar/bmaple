import React, { useEffect } from 'react';
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
import Themes from './mapping/Themes';
import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointsSource from './modules/waypoints/WaypointSource';
import WaypointsMenu from './modules/waypoints/WaypointsMenu';
import trajectoriesReducer from './modules/trajectories/trajectoriesSlice';
import TrajectoriesSource from './modules/trajectories/TrajectoriesSource';
import TrajectoriesMenu from './modules/trajectories/TrajectoriesMenu';
import TimeVerticalSensitiveWaypointsProfile from './modules/waypoints/TimeVerticalSensitiveWaypointProfile';
import TimeVerticalSensitiveTrajectoryProfile from './modules/trajectories/TimeVerticalSensitiveTrajectoryProfile';
import fwsTileReducer from './modules/fws-tiles/fwsTileSlice';
import FwsTileSource from './modules/fws-tiles/FwsTileSource';
import FwsTileProfile from './modules/fws-tiles/FwsTileProfile';

import regionsReducer from './modules/regions/regionsSlice';
import RegionsSource from './modules/regions/RegionsSource';
import RegionsProfile from './modules/regions/RegionsProfile';

import Info from './modules/info/Info';
import FloatingBox from './features/FloatingBox';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TimeScrollBar from './features/TimeScrollBar';
import MultiUnitScrollBar from './features/MultiUnitScrollBar';
import DiscreteMetaDataMenu from './features/DiscreteMetaDataMenu';
import RegionsMenu from './modules/regions/RegionsMenu';
import './App.css';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    waypoint: waypointReducer,
    trajectories: trajectoriesReducer,
    fwsTile: fwsTileReducer,
    regions: regionsReducer,
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
          <FwsTileProfile />
          <RegionsProfile />
        </Profiles>
        <Sources>
          <WaypointsSource cache={{}} sourceIdentifier={'waypoints'} />
          <TrajectoriesSource cache={{}} sourceIdentifier={'trajectories'} />
          <FwsTileSource sourceIdentifier={'tiles'} />
          <RegionsSource sourceIdentifier={'regions'} />
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
        <MultiUnitScrollBar
          selectValue={selectVerticalLevel}
          selectValues={selectVerticalLevels}
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
        <FoldOutItem id={'Trajectories'} icon={'map signs'}>
          <TrajectoriesMenu />
        </FoldOutItem>
        <FoldOutItem id={'Live Data'} icon={'image'}>
          <DiscreteMetaDataMenu id={0} apiUrl={'http://localhost:8989'} />
        </FoldOutItem>
        <FoldOutItem id={'Layers'} icon={'object group'}>
          <RegionsMenu />
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
