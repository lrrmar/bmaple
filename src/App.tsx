import React, { useEffect } from 'react';
import { configureStore, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import mapReducer from './mapping/mapSlice';
import { Action } from 'redux';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import DarkBaseMap from './mapping/DarkBaseMap';
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
import WaypointsMenu from './modules/waypoints/WaypointsMenu';
import trajectoriesReducer from './modules/trajectories/trajectoriesSlice';
import TrajectoriesSource from './modules/trajectories/TrajectoriesSource';
import TrajectoriesMenu from './modules/trajectories/TrajectoriesMenu';
import timeseriesReducer from './modules/timeseries/timeseriesSlice';
import BokehPlot from './modules/timeseries/BokehPlot';
import VisionToolkit from './modules/vision-toolkit/VisionToolkit';
import TimeVerticalSensitiveWaypointsProfile from './modules/waypoints/TimeVerticalSensitiveWaypointProfile';
import FloatingBox from './features/FloatingBox';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TempBaseMapMenu from './features/TempBaseMapMenu';
import ContourColourBar from './modules/force-geojson-field/contourColourBar/ContourColourBar';
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
          <GeojsonFieldProfile />
          <TimeVerticalSensitiveWaypointsProfile />
        </Profiles>
        <Sources>
          <GeojsonFieldSource cache={{}} sourceIdentifier={'geojsonField'} />
          <WaypointsSource cache={{}} sourceIdentifier={'waypoints'} />
          <TrajectoriesSource cache={{}} sourceIdentifier={'trajectories'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <OSMBaseMap id={'Open Street Map'} />
        </BaseMaps>
      </Map>
      <FloatingBox style={{ bottom: '130px', borderWidth: '0px' }}>
        <ContourColourBar />
      </FloatingBox>
      <FloatingBox style={{ bottom: '20px', borderWidth: '0px' }}>
        <TimeScrollBar />
      </FloatingBox>
      <FloatingBox
        style={{
          top: '20px',
          left: '20px',
          width: '0.4vw',
          height: '0.4vh',
          borderWidth: '0px',
        }}
        minimise={'x'}
      >
        <BokehPlot />
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
        <FoldOutItem id={'Waypoints'} icon={'map marker alternate'}>
          <WaypointsMenu />
        </FoldOutItem>
        <FoldOutItem id={'Trajectories'} icon={'share alternate'}>
          <TrajectoriesMenu />
        </FoldOutItem>
      </FoldOutMenu>
      <Themes>
        <GlassTabletTheme id={'glassTablet'} />
        <PlainTheme id={'Plain'} />
      </Themes>
      <VisionToolkit />
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
