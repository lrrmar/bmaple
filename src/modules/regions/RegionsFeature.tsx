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
import { Style, Stroke, Fill } from 'ol/style';
import Feature from 'ol/Feature';
import { getUid } from 'ol/util';

export interface Regions extends Pending {
  name: string;
}

export const isPendingRegions = (element: any): element is Regions => {
  const keys: string[] = Object.keys(element);
  return isPending(element) && keys.includes('name');
};

export const isEntryRegions = (element: any): element is Regions => {
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

const RegionsFeature = ({
  id,
  layerId,
  feature,
}: {
  id: string;
  layerId: string;
  feature: Feature;
}) => {
  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  //const layerData = cache[id];
  const loaded = useRef<boolean>(false);

  useEffect(() => {
    if (map && !loaded.current) {
      const layer = map.get(layerId);
      if (layer) {
        const description = feature.get('description');
        const upper = description.match(/Upper limit: ([^<]*)<br/)[1];
        const lower = description.match(/Lower limit: ([^<]*)<br/)[1];
        const featureData: { [key: string]: string | number } = {};
        featureData['lower limit'] = parseLimit(lower);
        featureData['upper limit'] = parseLimit(upper);
        feature.setStyle(new Style({}));
        layer.getSource().addFeature(feature);
        map.set(id, feature);
        feature.set('id', id);
        dispatch(
          ingest({
            ...featureData,
            id: id,
            name: feature.get('name'),
            source: 'regions',
            ol_uid: getUid(feature),
          }),
        );
        loaded.current = true;
        /*return () => {
    if (map) {
      const layer = map.get(layerId);
      const feature = map.get(id);
      layer.getSource().removeFeature(feature);
      map.unset(id);
    }
  }*/
      }
    }
  }, []);

  return <div></div>;
};

export default RegionsFeature;
