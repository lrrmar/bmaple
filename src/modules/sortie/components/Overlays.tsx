import React from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';

import {
  selectVisible as selectRegionsVisible,
  toggleVisible as toggleRegionsVisible,
} from '../../regions/regionsSlice';
/*import {
  selectVisible as selectNotamVisible,
  toggleVisible as toggleNotamVisible,
} from '../../notam/notamSlice';*/

import { selectAppStyle } from '../sortieSlice';

import { flagDocxPrint } from '../sortieSlice';
const Overlays = () => {
  const dispatch = useDispatch();
  const regionsVisible = useSelector(selectRegionsVisible);
  //const notamVisible = useSelector(selectNotamVisible);
  const appStyle = useSelector(selectAppStyle);

  return (
    <div className={'Page'}>
      <h1 style={{ alignSelf: 'center', margin: '1em' }}>Overlays</h1>
      <div
        style={{
          margin: '0.2em',
          padding: '0.2em',
          borderRadius: '0.2em',
          backgroundColor: regionsVisible ? appStyle.primaryColor : '#c0c0c0',
          color: regionsVisible ? '#ffffff' : appStyle.primaryColor,
        }}
        onClick={() => dispatch(toggleRegionsVisible())}
      >
        NATS Danger Areas
      </div>
      {/*<div
        style={{
          margin: '0.2em',
          padding: '0.2em',
          borderRadius: '0.2em',
          backgroundColor: notamVisible ? appStyle.primaryColor : '#c0c0c0',
          color: notamVisible ? '#ffffff' : appStyle.primaryColor,
        }}
        onClick={() => dispatch(toggleNotamVisible())}
      >
        NOTAM Areas
      </div>*/}
    </div>
  );
};

export default Overlays;
