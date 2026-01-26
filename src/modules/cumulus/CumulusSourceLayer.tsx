import React, { useEffect, useState, useRef, useMemo } from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import MVT from 'ol/format/MVT';
import { getUid } from 'ol/util';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { selectCache, ingest, Ingest } from '../../mapping/cacheSlice';
import { selectBaseUrl, updateProfileLayerId } from './cumulusSlice';
import openLayersMap from '../../mapping/OpenLayersMap';
import GeoJSON from 'ol/format/GeoJSON';
//import FastaHashTablesServer from './FastaHashTables';

interface Props {
  id: string;
  sourceIdentifier: string;
}

const CumulusSourceLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cumulusBaseUrl = useSelector(selectBaseUrl);
  //const fastaToken = useSelector(selectToken);
  const layerCache = useSelector(selectCache);

  const urlParams = id.split('?');
  const [url, setUrl] = useState(
    `https://${cumulusBaseUrl}/api/v1/onset/${urlParams[0]}/${urlParams[1]}/${urlParams[2]}/`,
  );

  const hasFetched = useRef(false);

  useEffect(() => {
    /* create OL vector layer and add to map, then cache the layer and update
     * pointer to fastaGraphicProfile
     */
    // if (!layerData) {return};
    if (hasFetched.current) {
      return;
    }
    if (layerCache[id]['source'] !== 'cumulus') {
      return;
    }
    hasFetched.current = true;
    const visible = false;

    console.log('CumulusSourceLayer creating GeoJSONLayer id:' + id);

    const maxZoom = 4;
    const zIndex = 6;

    const vLayer = new VectorLayer({
      source: new VectorSource({
        //maxZoom: maxZoom,
        format: new GeoJSON(),
        url: url,
      }),
      visible: true,
      //style: {
      //  'fill-color': 'rgba(255, 255, 0, 0.2)',
      //  'stroke-color': '#ffcc33',
      //  'stroke-width': 2,
      //},
      style: function (feature, resolution) {
        return [];
      },
    });

    vLayer.setZIndex(zIndex);
    const map = openLayersMap.map;
    map.addLayer(vLayer);

    // 2025-01-07 : I'm removing the postrender event handler and updating the
    // cache as soon as the layer is added to the map.
    // Could do with a way to flag that we've finished adding layers.
    //map.once('postrender', (event) => {
    const toCache: Ingest = {
      id: id,
      source: 'cumulus',
      ol_uid: getUid(vLayer),
    };

    //dispatch(cacheLayer(toCache));
    dispatch(ingest(toCache));

    console.log('Added Ingest to cache: ' + id + ' : ' + toCache.ol_uid);

    // Update the rendering
    dispatch(updateProfileLayerId(id));

    //setTimeout(() => {
    //  vLayer.setExtent(undefined); // Reset to allow loading dynamically later
    //}, 3000);
    //}); // once
  }, []);

  return null;
};

export default CumulusSourceLayer;
