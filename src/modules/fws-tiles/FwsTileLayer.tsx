import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { getUid } from 'ol/util';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { ingest, Ingest, selectCache } from '../../mapping/cacheSlice';
import { selectApiUrl, selectOpacity } from './fwsTileSlice';

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
const FwsTileLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const apiUrl = useSelector(selectApiUrl);
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  const layerCache = useSelector(selectCache);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }
    const fetchTileUrl = async (id: string) => {
      const response = await fetch(`${apiUrl}/resourceById/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const json = await response.json();
      setTileUrl(json)
    }
    fetchTileUrl(id);
  },[])

  useEffect(() => {
    /* create OL vector layer and add to map, then cache the layer and update
     * pointer to fastaGraphicProfile
     */
    if (hasFetched.current) {
      return;
    }
    if (layerCache[id]['source'] !== sourceIdentifier) {
      return;
    }
    if (tileUrl) {
      hasFetched.current = true;
      const vtLayer = new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          url: tileUrl,
        }),
        visible: true,
        style: function (feature, resolution) {
          return [];
        },
      });

      vtLayer.setZIndex(6);
      const map = OpenLayersMap.map;
      map.addLayer(vtLayer);

      const toCache: Ingest = {
        id: id,
        source: sourceIdentifier,
        ol_uid: getUid(vtLayer),
      };

      //dispatch(cacheLayer(toCache));
      dispatch(ingest(toCache));

      //console.log("Added Ingest to cache: " + id + " : " + toCache.ol_uid);

      setTimeout(() => {
        vtLayer.setExtent(undefined); // Reset to allow loading dynamically later
      }, 3000);
    }
  
      //}); // once
  }, [tileUrl]);

  return null;
};

export default FwsTileLayer;
