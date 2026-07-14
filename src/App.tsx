import React, { useEffect } from 'react';
import { configureStore, PayloadAction, ThunkAction } from '@reduxjs/toolkit';

import mapReducer, {
  selectVerticalLevel,
  selectVerticalLevelsIntersection,
  updateVerticalLevel,
} from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import BaseMaps from './mapping/BaseMaps';
import Themes from './mapping/Themes';
import GlassTabletTheme from './mapping/GlassTabletTheme';
import PlainTheme from './mapping/PlainTheme';
import forceNwrReducer from './modules/force-nwr/forceNwrSlice';
import ForceNwrSource from './modules/force-nwr/ForceNwrSource';
import ForceNwrProfile from './modules/force-nwr/ForceNwrProfile';
import FloatingBox from './features/FloatingBox';
import TimeScrollBar from './features/TimeScrollBar';
import MultiUnitScrollBar from './features/MultiUnitScrollBar';
import Tiles from './features/Tiles';
import LoadingScreen from './modules/force-nwr/LoadingScreen';
import BackgroundImage from './modules/force-nwr/BackgroundImage';
import './App.css';

// Configure the reducers that will be used in the app

export const store = configureStore({
  reducer: {
    map: mapReducer,
    cache: cacheReducer,
    forceNwr: forceNwrReducer,
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
        </Profiles>
        <Sources>
          <ForceNwrSource sourceIdentifier={'force-nwr'} />
        </Sources>
        <BaseMaps></BaseMaps>
      </Map>
      <LoadingScreen />
      <BackgroundImage />
      <div
        style={{
          position: 'absolute',
          left: '12vw',
          top: '6vh',
          width: '76vw',
          height: '82vh',
          zIndex: '20',
          display: 'flex',
          alignItems: 'centre',
        }}
      >
        <Tiles apiUrl={'http://localhost:8989'} />
      </div>
      <FloatingBox
        style={{
          bottom: '20px',
          left: '10px',
          borderWidth: '0px',
          zIndex: '21',
          backgroundColor: 'rgba(0,0,0,0)',
          width: '20vw',
          objectFit: 'contain',
        }}
      >
        <img
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
          src={process.env.PUBLIC_URL + '/ncas-logo.png'}
        />
      </FloatingBox>
      <FloatingBox
        style={{
          top: '20px',
          left: '10px',
          borderWidth: '0px',
          zIndex: '21',
          backgroundColor: 'rgba(0,0,0,0)',
          width: '20vw',
          objectFit: 'contain',
        }}
      ></FloatingBox>
      <FloatingBox
        style={{
          top: '20px',
          left: '10px',
          borderWidth: '0px',
          zIndex: '21',
          backgroundColor: 'rgba(0,0,0,0)',
          objectFit: 'contain',
        }}
      ></FloatingBox>
      <FloatingBox style={{ bottom: '20px', borderWidth: '0px', zIndex: '21' }}>
        <TimeScrollBar />
      </FloatingBox>
      <FloatingBox style={{ top: '20px', borderWidth: '0px' }}>
        <MultiUnitScrollBar
          selectValue={selectVerticalLevel}
          selectValues={selectVerticalLevelsIntersection}
          updateValue={updateVerticalLevel}
          orientation={'vertical'}
        />
      </FloatingBox>
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
