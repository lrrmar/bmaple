import React from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';

import { selectAppStyle } from '../sortieSlice';

import { flagDocxPrint } from '../sortieSlice';
const Download = () => {
  const dispatch = useDispatch();
  const appStyle = useSelector(selectAppStyle);

  return (
    <div className={'Page'}>
      <h1 style={{ alignSelf: 'center', margin: '1em' }}>Downloads</h1>
      <div
        onClick={() => {
          // This is picked up in ../components/FlightPlan where
          // all the flight info is held
          dispatch(flagDocxPrint());
        }}
        style={{
          margin: '0.2em',
          padding: '0.2em',
          borderRadius: '0.2em',
          backgroundColor: appStyle.primaryColor,
          color: '#ffffff',
        }}
      >
        Download Sortie Brief Document
      </div>
      <div>KML to be added soon!</div>
    </div>
  );
};

export default Download;
