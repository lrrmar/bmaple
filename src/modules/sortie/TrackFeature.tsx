import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  update,
  remove,
  selectCache,
  Pending,
  isEntry,
  isPending,
} from '../../mapping/cacheSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';

// import OpenLayers types
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import { getUid } from 'ol/util';
import { fromLonLat } from 'ol/proj';
import { GeoJSON } from 'ol/format';

import { type Waypoint } from './lib/state/types';
import { type WaypointJson } from './lib/io/types';
import WaypointRegistry from './lib/state/WaypointRegistry';

export interface Track extends Pending {
  waypoints: [string, string];
}

export const isTrack = (element: any): element is Track => {
  return (
    element.waypoints &&
    element.waypoints.length == 2 &&
    typeof element.waypoints.at(0) == 'string' &&
    typeof element.waypoints.at(1) == 'string'
  );
};
export const isPendingTrack = (element: any): element is Track => {
  const keys: string[] = Object.keys(element);
  return (
    element.waypoints && element.waypoints.length == 2 && isPending(element)
  );
};

export const isEntryTrack = (element: any): element is Track => {
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

const TrackFeature = ({ id, layerId }: { id: string; layerId: string }) => {
  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map>(OpenLayersMap.map);
  const mapUtils = new OpenLayersMap();
  const initialised = useRef<boolean>(false);
  const [waypointIds, setWaypointIds] = useState<[string, string]>(['', '']);
  const [coords, setCoords] = useState<[[number, number], [number, number]]>();
  const coordsRef = useRef<[[number, number], [number, number]]>([
    [-9999, -9999],
    [-9999, -9999],
  ]);

  useEffect(() => {
    // Get the coords of waypoints
    const featureData = cache[id];
    if (featureData && isTrack(featureData)) {
      const waypointId0 = featureData.waypoints.at(0);
      const waypointId1 = featureData.waypoints.at(1);
      if (waypointId0 && waypointId1) {
        const waypoint0 = WaypointRegistry.getWaypoint(waypointId0);
        const waypoint1 = WaypointRegistry.getWaypoint(waypointId1);
        if (waypoint0 && waypoint1) {
          const coords0: [number, number] = [
            waypoint0.getLongitude(),
            waypoint0.getLatitude(),
          ];
          const coords1: [number, number] = [
            waypoint1.getLongitude(),
            waypoint1.getLatitude(),
          ];
          if (
            coordsRef.current[0][0] !== coords0[0] ||
            coordsRef.current[0][1] !== coords0[1] ||
            coordsRef.current[1][0] !== coords1[0] ||
            coordsRef.current[1][1] !== coords1[1]
          ) {
            setCoords([coords0, coords1]);
          }
        }
      }
    }
  }, [cache]);

  useEffect(() => {
    if (coords) {
      const layer = map.get(layerId);
      const oldFeature = map.get(id);
      if (oldFeature) layer.getSource().removeFeature(oldFeature);
      const feature = new Feature({
        geometry: new LineString(coords.map((coord) => fromLonLat(coord))),
        visible: false,
      });

      layer.getSource().addFeature(feature);
      map.set(id, feature);
      feature.set('id', id);
      dispatch(
        update({
          id: id,
          ol_uid: getUid(feature),
        }),
      );

      return () => {
        const layer = map.get(layerId);
        const feature = map.get(id);
        layer.getSource().removeFeature(feature);
        map.unset(id);
      };
    }
  }, [coords]);

  return <div></div>;
};

export default TrackFeature;
