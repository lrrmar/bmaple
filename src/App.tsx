import React, { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import DarkBaseMap from './mapping/DarkBaseMap';
import LightBaseMap from './mapping/LightBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import Themes from './mapping/Themes';
import SoftBlockTheme from './mapping/SoftBlockTheme';
import GlassTabletTheme from './mapping/GlassTabletTheme';
import geojsonFieldReducer from './modules/force-geojson-field/geojsonFieldSlice';
import GeojsonFieldSource from './modules/force-geojson-field/GeojsonFieldSource';
import GeojsonFieldProfile from './modules/force-geojson-field/GeojsonFieldProfile';
import LayerSelector from './modules/force-geojson-field/LayerSelector';
import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointSource from './modules/waypoints/WaypointSource';
import WaypointProfile from './modules/waypoints/WaypointProfile';
import FloatingBox from './features/FloatingBox';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TempBaseMapMenu from './features/TempBaseMapMenu';
import ContourColourBar from './modules/force-geojson-field/contourColourBar/ContourColourBar';
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
          <WaypointProfile />
        </Profiles>
        <Sources>
          <GeojsonFieldSource cache={{}} sourceIdentifier={'geojsonField'} />
          <WaypointSource cache={{}} sourceIdentifier={'waypoint'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
      </Map>
      <FloatingBox
        minimise={''}
        style={{ top: '10px', flexDirection: 'column-reverse', width: 'auto' }}
      ></FloatingBox>
      <FloatingBox style={{ bottom: '80px', borderWidth: '0px' }}>
        <ContourColourBar />
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
        <SoftBlockTheme id={'softBlock'} />
        <GlassTabletTheme id={'glassTablet'} />
      </Themes>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
