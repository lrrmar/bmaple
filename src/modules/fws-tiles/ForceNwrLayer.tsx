import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import { transformExtent } from 'ol/proj';
import { getUid } from 'ol/util';
import MapType from 'ol/Map';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { ingest, Ingest, selectCache } from '../../mapping/cacheSlice';
import { selectApiUrl, selectOpacity } from './forceNwrSlice';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
proj4.defs(
  'force_nwr_projection',
  '+proj=lcc +lat_1=60 +lat_2=50 +lat_0=55 +lon_0=-2.5 +datum=WGS84 +units=m +no_defs',
);
register(proj4);

// Generic typing for properties that come out of an openlayers
// feature, TODO pin this down a bit more...

interface Props {
  id: string;
  sourceIdentifier: string;
}

const ForceNwrLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const cacheElement = cache[id];
  const [imageExtent, setImageExtent] = useState<number[] | null>(null);
  const [map, setMap] = useState<MapType | null>(OpenLayersMap.map);
  const hasFetched = useRef(false);
  const [layerData, setLayerData] = useState<Blob | null>(null);
  const apiUrl = useSelector(selectApiUrl);

    // Add the VectorLayer to the map
    const add = map.addLayer(layer);

    map.once('postrender', (event) => {
      // Once image loaded, push properties to cache
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
  }, [imageExtent]);

  return <div></div>;
};

export default ForceNwrLayer;
