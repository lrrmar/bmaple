import React from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import { selectZoom } from '../mapping/mapSlice';

const MapInfo = () => {
  const zoom = useSelector(selectZoom);
  return <div>{`Zoom level: ${zoom - 1}`}</div>;
};
export default MapInfo;
