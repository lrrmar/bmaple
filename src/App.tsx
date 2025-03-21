import React, { useEffect } from 'react';
import { configureStore, PayloadAction } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import DarkBaseMap from './mapping/DarkBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import Themes from './mapping/Themes';
import GlassTabletTheme from './mapping/GlassTabletTheme';
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
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <OSMBaseMap id={'Open Street Map'} />
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
      </FoldOutMenu>
      <Themes>
        <GlassTabletTheme id={'glassTablet'} />
      </Themes>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type Selector<T> = (state: RootState) => T;
export type Action<T> = (payload: T) => PayloadAction<T>;
