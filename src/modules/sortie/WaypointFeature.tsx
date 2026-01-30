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
import Icon from 'ol/style/Icon.js';
import RegularShape from 'ol/style/RegularShape.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';

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

const WaypointFeature = ({
  id,
  layerId,
}: {
  id: string;
  layerId: string;
}) => {
  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const mapUtils = new OpenLayersMap();
  const initialised = useRef<boolean>(false);

  useEffect(() => {
    const featureData = cache[id];
    if (featureData && !initialised.current && map) {
      const layer = map.get(layerId);
      if (layer) {
        const latitude = featureData.latitude;
        const longitude = featureData.longitude;
        if (typeof latitude == 'number' && typeof longitude == 'number') {

          const canvas = document.createElement('canvas');
          canvas.width = 40;
          canvas.height = 20;
          
          const ctx = canvas.getContext('2d');

          ctx.save();
          ctx.strokeStyle = 'rgba(0,100,100,0.9)';
          ctx.fillStyle = 'rgba(0,100,100,0.9)';
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          ctx.lineTo(canvas.height*.25, 0);
          ctx.lineTo(canvas.width, 0);
          ctx.lineTo(canvas.width - canvas.height*.125, canvas.height*.51);
          ctx.lineTo(canvas.height*.125, canvas.height*.5);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();

          ctx.fill();
          ctx.stroke();
          
          ctx.restore() 

          ctx.save() 
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.fillText(featureData.id.split('-')[1], canvas.height*.5,  canvas.height*.5,)
          
          ctx.restore() 

          const feature = new Feature({
            geometry: new Point(fromLonLat([-longitude, latitude])),
          })
          layer.getSource().addFeature(feature);
          //feature.on('click', alert(featureData.name) )
          feature.setStyle(
            new Style({
              image: new Icon({
                img: canvas,
                size: [canvas.width, canvas. height],
                anchor: [0, 1]
              })
            })
          )
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
  }, [cache]);

  return <div></div>;
};

export default WaypointFeature;
