import React from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';

import {
  updateOpacity,
  updateCurrentLayerName,
  selectCurrentLayerName,
  selectLayerNames,
} from './bgsWmsSlice';

const BGSWMSMenu = () => {
  const dispatch = useDispatch();
  const layerNames = useSelector(selectLayerNames);
  const currentLayerName = useSelector(selectCurrentLayerName);

  return (
    <div>
      <select
        value={currentLayerName ? currentLayerName : 'select layer'}
        onChange={(e) => {
          dispatch(updateCurrentLayerName(e.target.value));
        }}
        defaultValue={'select layer'}
      >
        {layerNames.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <input
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

export default BGSWMSMenu;
