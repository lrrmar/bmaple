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

const RegionsLayer = ({
  id,
  sourceIdentifier,
}: {
  id: string;
  sourceIdentifier: string;
}) => {
  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const layerData = cache[id];
  const loaded = useRef<boolean>(false);

  useEffect(() => {
    if (
      loaded.current ||
      !map ||
      !layerData ||
      isEntry(layerData) ||
      !isPendingRegions(layerData) ||
      layerData['source'] !== sourceIdentifier
    ) {
    } else {
      loaded.current = true;
      fetch('./NATS-danger-areas.kml')
        .then((r) => r.text())
        .then((kmlText) => {
          const features = new KML().readFeatures(kmlText, {
            featureProjection: 'EPSG:3857',
          });
          features.forEach((f, i) => {
            const description = f.get('description');
            const upper = description.match(/Upper limit: ([^<]*)<br/)[1];
            const lower = description.match(/Lower limit: ([^<]*)<br/)[1];
            const featureData = { ...layerData };
            featureData['lower limit'] = parseLimit(lower);
            featureData['upper limit'] = parseLimit(upper);
            const layer = new VectorLayer({
              source: new VectorSource({ features: [f] }),
              zIndex: 20,
              visible: false,
            });
            if (map) map.addLayer(layer);
            dispatch(
              ingest({
                ...featureData,
                id: `nats-danger-area-${i}`,
                name: f.get('name'),
                ol_uid: getUid(layer),
              }),
            );
          });
        });
    }
  }, []);

  return <div></div>;
};

export default RegionsLayer;
