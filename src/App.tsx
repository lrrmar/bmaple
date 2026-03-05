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
import simpleTileReducer from './modules/simple-tiles/simpleTileSlice';
import SimpleTileSource from './modules/simple-tiles/SimpleTileSource';
import SimpleTileProfile from './modules/simple-tiles/SimpleTileProfile';

import FloatingBox from './features/FloatingBox';
import ErrorMessage from './features/ErrorMessage';
import MapInfo from './features/MapInfo';
import { FoldOutMenu, FoldOutItem } from './features/FoldOutMenu/FoldOutMenu';
import TimeScrollBar from './features/TimeScrollBar';
import MultiUnitScrollBar from './features/MultiUnitScrollBar';
import SimpleTileMenu from './features/SimpleTileMenu';
import './App.css';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    simpleTile: simpleTileReducer,
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
          <SimpleTileProfile />
        </Profiles>
        <Sources>
          <SimpleTileSource sourceIdentifier={'tiles'} />
        </Sources>
        <BaseMaps>
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'Open Street Map'} />
        </BaseMaps>
      </Map>
      <FoldOutMenu theme={'light'} align={'left'}>
        <FoldOutItem id={'Tiles'} icon={'image'}>
          <SimpleTileMenu />
        </FoldOutItem>
      </FoldOutMenu>
      <Themes></Themes>
      <FloatingBox>
        <MapInfo />
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
