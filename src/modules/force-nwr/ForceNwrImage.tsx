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

const ForceNwrImage = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const cacheElement = cache[id];
  const hasFetched = useRef(false);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const apiUrl = useSelector(selectApiUrl);

  useEffect(() => {
    if (hasFetched.current) return;
    setSrcUrl(apiUrl + '/resourceById?id=' + id);
    const toCache = {
      // what metadata?
      ...cacheElement,
      id: id,
      ol_uid: id,
    };
    dispatch(ingest(toCache));
    hasFetched.current = true;
  }, []);

  return (
    <div id={id} style={{ display: 'none' }}>
      {srcUrl && <img id={id} src={srcUrl}></img>}
    </div>
  );
};

export default ForceNwrImage;
