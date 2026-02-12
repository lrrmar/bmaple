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
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import bezierSpline from '@turf/bezier-spline';
import { GeoJSON } from 'ol/format';
import {
  Feature as GeoJSONFeature,
  LineString as GeoJSONLineString,
} from 'geojson';

import { type Waypoint } from './lib/state/types';
import WaypointRegistry from './lib/state/WaypointRegistry';

export interface Track extends Pending {
  waypoints: [string, string];
}

export const isTrack = (element: any): element is Track => {
  return element.waypoints && element.waypoints.length == 2;
}
export const isPendingTrack = (element: any): element is Track => {
  const keys: string[] = Object.keys(element);
  return element.waypoints && element.waypoints.length == 2 && isPending(element);
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
  const [waypointIds, setWaypointIds] = useState<[string,string]>(['','']);

  useEffect(() => {
    const featureData = cache[id];
    if (featureData && isTrack(featureData)) {
      if (waypointIds.at(0) == featureData.waypoints.at(0) && waypointIds.at(1) == featureData.waypoints.at(1)) {
        // Equality between old and new waypoints , do nowt.
        void(0)
      } else {
      const waypoints: Waypoint[] = [];
      featureData.waypoints.forEach((id) => {
        if (typeof id == 'string') {
          const waypoint = WaypointRegistry.getWaypoint(id);
          if (waypoint) waypoints.push(waypoint);
        }
      });
      const layer = map.get(layerId);
      if (layer) {
        const coords = waypoints.map((waypoint) => {
          return fromLonLat([-waypoint.getLongitude(), waypoint.getLatitude()]);
        });

        const feature = new Feature({
          geometry: new LineString(coords),
          visible: false,
        });
        const format = new GeoJSON();

        // Convert to GeoJSON
        /*const geojson = format.writeFeatureObject(feature, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }) as GeoJSONFeature<GeoJSONLineString>;

        if (geojson.geometry.type !== 'LineString') {
          // CANCELLING FOR NOW
          // Smooth it
          const curved = bezierSpline(geojson, {
            resolution: 1000000,
            sharpness: 5,
          });

          // Back to OpenLayers feature
          const curvedFeature = format.readFeature(curved, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          });
          curvedFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: '#f0a040',
                width: 2,
              }),
            }),
          );
          const oldFeature = map.get(id);
          layer.getSource().removeFeature(oldFeature);
          layer.getSource().addFeature(curvedFeature);
          map.set(id, curvedFeature);
      } else {*/
          layer.getSource().addFeature(feature);
          map.set(id, feature);
          feature.set('id', id);
          dispatch(update({
            id: id,
            ol_uid: getUid(feature),
          }))
        //}
      }
    }
  }

  return () => {
    const layer = map.get(layerId);
    const feature = map.get(id);
    layer.getSource().removeFeature(feature);
    map.unset(id);
  }
  }, [])

  return <div></div>;
};

export default TrackFeature;
