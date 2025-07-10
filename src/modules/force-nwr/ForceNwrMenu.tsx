import React from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';

import { updateOpacity } from './forceNwrSlice';

const ForceNwrMenu = () => {
  const dispatch = useDispatch();

  return (
    <div>
      {'Opacity'}
      <input
        style={{
          borderRadius: '20px',
          backgroundColor: '#e0e0ff',
        }}
        type="range"
        min={0.0}
        max={1.0}
        step={0.1}
        onChange={(e) => {
          dispatch(updateOpacity(parseFloat(e.target.value)));
        }}
      ></input>
    </div>
  );
};

export default ForceNwrMenu;
