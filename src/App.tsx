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
import geojsonFieldReducer from './modules/force-geojson-field/geojsonFieldSlice';
import GeojsonFieldSource from './modules/force-geojson-field/GeojsonFieldSource';
import GeojsonFieldProfile from './modules/force-geojson-field/GeojsonFieldProfile';
import LayerSelector from './modules/force-geojson-field/LayerSelector';
import FloatingBox from './features/FloatingBox';
import FoldOutMenu from './features/FoldOutMenu/FoldOutMenu';
import TempBaseMapMenu from './features/TempBaseMapMenu';
import ContourColourBar from './modules/force-geojson-field/contourColourBar/ContourColourBar';
import './App.css';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    geojsonField: geojsonFieldReducer,
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
        </Profiles>
        <Sources>
          <GeojsonFieldSource cache={{}} sourceIdentifier={'geojsonField'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
      </Map>
      <FloatingBox
        style={{
          backgroundImage:
            'linear-gradient(to top, rgb(0, 0, 0), rgb(28, 28, 28)',
          color: 'rgb(250, 250, 250)',
        }}
      >
        <LayerSelector />
      </FloatingBox>
      <FloatingBox minimise={'?'} style={{ top: '10px' }}>
        <ContourColourBar />
      </FloatingBox>
      <FoldOutMenu align={'left'}>
        <TempBaseMapMenu id={'style'} />
      </FoldOutMenu>
    </div>
  );
};

export default App;
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
