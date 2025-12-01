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
import { fromLonLat } from 'ol/proj';
import { getUid } from 'ol/util';

import Feature from 'ol/Feature';
import Circle from 'ol/geom/Circle';

export interface FaamPhysics extends Pending {
  name: string;
}

export const isPendingFaamPhysics = (element: any): element is FaamPhysics => {
  const keys: string[] = Object.keys(element);
  return isPending(element) && keys.includes('name');
};

export const isEntryFaamPhysics = (element: any): element is FaamPhysics => {
  const keys: string[] = Object.keys(element);
  return isEntry(element) && keys.includes('name');
};

const FaamPhysicsLayer = ({
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
      !isPendingFaamPhysics(layerData) ||
      layerData['source'] !== sourceIdentifier
    ) {
    } else {
      loaded.current = true;
      const circle = new Feature({
        geometry: new Circle(fromLonLat([-0.1276, 51.5072]), 20000),
      });
      const layer = new VectorLayer({
        source: new VectorSource({
          features: [circle],
        }),
        zIndex: 20,
        visible: false,
      });
      if (map) map.addLayer(layer);
    dispatch(
        ingest({
          source: sourceIdentifier,
          id: 'faam-ring',
          name: 'faam ring',
          ol_uid: getUid(layer),
          features: [getUid(circle)] // allows better searching for clicks
        }),
      );
    }
  }, []);

  return <div></div>;
};

export default FaamPhysicsLayer;
