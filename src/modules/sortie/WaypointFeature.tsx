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
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { getUid } from 'ol/util';
import { fromLonLat } from 'ol/proj';
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

const WaypointFeature = ({ id, layerId }: { id: string; layerId: string }) => {
  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const mapUtils = new OpenLayersMap();
  const initialised = useRef<boolean>(false);
  const coordsRef = useRef<{ latitude: number; longitude: number }>();

  useEffect(() => {
    const featureData = cache[id];
    if (
      featureData &&
      map &&
      (!initialised.current ||
        (coordsRef.current &&
          featureData.latitude !== coordsRef.current.latitude) ||
        (coordsRef.current &&
          featureData.longitude !== coordsRef.current.longitude))
    ) {
      const layer = map.get(layerId);
      if (layer) {
        const oldFeature = map.get(id);
        if (oldFeature) layer.getSource().removeFeature(oldFeature);
        const latitude = featureData.latitude;
        const longitude = featureData.longitude;
        if (typeof latitude == 'number' && typeof longitude == 'number') {
          const feature = new Feature({
            geometry: new Point(fromLonLat([longitude, latitude])),
          });
          layer.getSource().addFeature(feature);
          feature.set('id', id);
          map.set(id, feature);
          dispatch(
            ingest({
              ...featureData,
              ol_uid: getUid(feature),
            }),
          );
          initialised.current = true;
          coordsRef.current = { latitude: latitude, longitude: longitude };
        }
      }
    } else if (
      featureData &&
      map &&
      coordsRef.current &&
      (featureData.latitude !== coordsRef.current.latitude ||
        featureData.longitude !== coordsRef.current.longitude)
    ) {
      const feature = map.get(id);
    }
  }, [cache]);

  return <div></div>;
};

export default WaypointFeature;
