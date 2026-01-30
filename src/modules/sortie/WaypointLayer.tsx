import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  ingest,
  selectCache,
  Pending,
  isEntry,
  isPending,
} from '../../mapping/cacheSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';

// import OpenLayers types
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import KML from 'ol/format/KML';
import { getUid } from 'ol/util';

export interface Waypoint extends Pending {
  name: string;
}

export const isPendingWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return isPending(element) && keys.includes('name');
};

export const isEntryWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return isEntry(element) && keys.includes('name');
};

const parseLimit = (limit: string) => {
  const isSFC = limit.slice(0, 3) === 'SFC';
  if (isSFC) return 0;

  const isUNL = limit.slice(0, 3) === 'UNL';
  if (isUNL) return 100000;

  const isFL = limit.slice(0, 2) === 'FL';
  if (isFL) return parseInt(limit.slice(2, -1)) * 1000;

  const bits = limit.split(' ');
  const feet = parseInt(bits[0]);
  return feet;
};

const WaypointLayer = ({
  id,
  children
}: {
  id: string;
  children: React.ReactNode;
}) => {
  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const featureData = cache[id];
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const initialised = useRef<boolean>(false);

  useEffect(() => {
    if (cache[id] && !initialised.current) {
      const layer = new VectorLayer({
        source: new VectorSource({}),
        zIndex: 20,
      });
      if (map) {
        map.addLayer(layer);
        layer.set('id', id)
        map.set(id, layer);
        dispatch(
          ingest({
            ...featureData,
            ol_uid: getUid(layer),
          }),
        );
        initialised.current = true;
      }
    }
  }, [id]);

  return <div>{children}</div>;
};

export default WaypointLayer;
