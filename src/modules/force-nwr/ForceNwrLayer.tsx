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
import { updateProfileId, selectApiUrl, selectOpacity } from './forceNwrSlice';

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

  const fetchResourceInfo = async () => {
    const response = await fetch(`${apiUrl}/resourceInfoById/?id=${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await response.json();
    setImageExtent(json.extent);
  };
  useEffect(() => {
    // On initial render request information necessary for rendering
    fetchResourceInfo();
  }, []);

  useEffect(() => {
    if (!imageExtent) {
      return;
    }
    if (!map) {
      return;
    }

    /*if (hasFetched.current) {
      dispatch(updateProfileId(id));
      return;
    }*/
    const tempImageExtent = [-10.7, 47.5, 2.1, 60.85];
    const imageExtentInLambert = transformExtent(
      tempImageExtent,
      'EPSG:4326',
      'force_nwr_projection',
    );
    const imageExtentInMap = transformExtent(
      imageExtentInLambert,
      'force_nwr_projection',
      'EPSG:3857',
    );
    const source = new ImageStatic({
      url: `${apiUrl}/resourceById/?id=${id}`,
      imageExtent: imageExtentInMap,
      projection: 'EPSG:3857',
    });

    // Generate OpenLayers VectorLayer from the VectorSource
    const layer = new ImageLayer({
      source: source,
      zIndex: 20,
      opacity: 0.0,
    });

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
