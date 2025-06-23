import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import { get } from 'ol/proj';
import { getUid } from 'ol/util';
import MapType from 'ol/Map';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { ingest, Ingest, selectCache } from '../../mapping/cacheSlice';
import { updateProfileId, selectApiUrl } from './teamxSlice';

// Generic typing for properties that come out of an openlayers
// feature, TODO pin this down a bit more...

interface Props {
  id: string;
  sourceIdentifier: string;
}

const TeamxLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const cacheElement = cache[id];
  const [map, setMap] = useState<MapType | null>(OpenLayersMap.map);
  const hasFetched = useRef(false);
  const [layerData, setLayerData] = useState<Blob | null>(null);
  const apiUrl = 'http://localhost:8383/resourceById/';

  useEffect(() => {
    if (!map) {
      return;
    }

      /*if (hasFetched.current) {
      dispatch(updateProfileId(id));
      return;
    }*/
    const source = new Static({
      url: `${apiUrl}?id=${id}`,
      imageExtent: [15.0, 35.0, 35.0, 45.6],
      projection: 'EPSG:4326',
    });

    // Generate OpenLayers VectorLayer from the VectorSource
    const layer = new ImageLayer({
      source: source,
      zIndex: 20,
      opacity: 0,
    });

    // Add the VectorLayer to the map
    const add = map.addLayer(layer);

    map.once('postrender', (event) => {
      console.log('post render');
      // Once rendered, push properties to cache
      const ol_uid: string | null = getUid(layer);
      // Big error... how can we handle?
      if (!ol_uid) return;
      const toCache = {
        // what metadata?
        ...cacheElement,
        id: id,
        ol_uid: ol_uid,
      };
      dispatch(ingest(toCache));
      hasFetched.current = true;
    });
    return () => {
      map.removeLayer(layer);
    };
  }, []);

  return <div></div>;
};

export default TeamxLayer;
