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
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';

export interface Track extends Pending {
  name: string;
}

export const isPendingTrack = (element: any): element is Track => {
  const keys: string[] = Object.keys(element);
  return isPending(element) && keys.includes('name');
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
/*  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const mapUtils = new OpenLayersMap();
  const initialised = useRef<boolean>(false);

  useEffect(() => {
    const featureData = cache[id];
    console.log(featureData);
    if (featureData && !initialised.current && map) {
      const layer = map.get(layerId);
      console.log(featureData);
      if (layer) {
        const waypointIds = featureData.waypoints;
        if (waypointIds) {
          console.log(waypointIds);

          /////// start here!

          const feature = new Feature({
            geometry: new Point(fromLonLat([-longitude, latitude])),
          });
          layer.getSource().addFeature(feature);
          //feature.on('click', alert(featureData.name) )
          feature.setStyle(
            new Style({
              image: new Icon({
                img: canvas,
                size: [canvas.width, canvas.height],
                anchor: [0, 1],
              }),
            }),
          );
          feature.set('id', id);
          map.set(id, feature);
          dispatch(
            ingest({
              ...featureData,
              ol_uid: getUid(feature),
            }),
          );
          initialised.current = true;
        }
      }
    }
  }, [cache]);*/

  return <div></div>;
};

export default TrackFeature;
