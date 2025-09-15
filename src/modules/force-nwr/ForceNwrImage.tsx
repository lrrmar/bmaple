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

const ForceNwrImage = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const cacheElement = cache[id];
  const hasFetched = useRef(false);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const apiUrl = useSelector(selectApiUrl);
  const imgRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    if (hasFetched.current) return;
    imgRef.current.onload = () => {
      const toCache = {
        source: sourceIdentifier,
        id: id,
        ol_uid: id,
      };
      dispatch(ingest(toCache));
      hasFetched.current = true;
    };
    imgRef.current.src = apiUrl + '/resourceById/?id=' + id;
  }, []);

  return (
    <div style={{ overflow: 'hidden', width: '100px', height: '100px' }}>
      {hasFetched.current && (
        <img
          id={'img' + id}
          style={{ opacity: 0, position: 'absolute', zIndex: 0 }}
          src={imgRef.current.src}
        ></img>
      )}
    </div>
  );
};

export default ForceNwrImage;
