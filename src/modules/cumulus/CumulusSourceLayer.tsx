import React, { useEffect, useState, useRef, useMemo } from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import MVT from 'ol/format/MVT';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
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
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import type { Extent } from 'ol/extent';

interface Props {
  id: string;
  sourceIdentifier: string;
  extent: Extent | null;
}

const CumulusSourceLayer = ({ id, sourceIdentifier, extent }: Props) => {
  const dispatch = useDispatch();
  const cumulusBaseUrl = useSelector(selectBaseUrl);
  //const fastaToken = useSelector(selectToken);
  const layerCache = useSelector(selectCache);

  // Map from: https://dev.fastaweather.com/api/v1/onset/doy/2025/02/04/44/
  // To: https://cumulusstorageaccount1.blob.core.windows.net/data/2025_Ghana_onset/20250501/forecast_status_20250501_onset_day_of_year_entry039.geojson
  // To: https://cumulusstorageaccount1.blob.core.windows.net/data/downscaling-inference-outputs/png/[yyyy-mm-dd]/model_unet_precip/precip_24h/data/[yyyy-mm-dd]T00_lead[nnn]h.png
  // doy/2025/02/04/44/
  // 20250501/forecast_status_20250501_onset_day_of_year_entry039.geojson

  const urlParams = id.split('?');

  // Map API-style parameters to an Azure blob subpath and full blob URL.
  // Example input `urlParams` array: ["2026-09-13", "024h"]
  // Produces subpath: "2026-09-13/model_unet_precip/precip_24h/data/2026-09-13T00_lead024h.png"
  const mapParamsToBlobUrl = (
    params: string[],
    storageHost: string,
    // optional prefix path inside the container (e.g. "data/2025_Ghana_onset")
    containerPrefix = '',
  ) => {
    const [datePart, leadTimePart] = params;
    const subpath = `${datePart}/model_unet_precip/precip_24h/data/${datePart}T00_lead${leadTimePart}.png`;
    // doyT00_lead2026-09-07.png
    // Build full URL. `storageHost` may already include container/prefix.
    const host = storageHost.replace(/\/+$/g, '');
    const cp = containerPrefix.replace(/^\/+|\/+$/g, '');
    const path = cp ? `${cp}/${subpath}` : subpath;
    return `https://${host}/${path}`;
  };

  const [url, setUrl] = useState(() =>
    mapParamsToBlobUrl(urlParams, cumulusBaseUrl),
  );

  const hasFetched = useRef(false);

  useEffect(() => {
    /* create OL vector layer and add to map, then cache the layer and update
     * pointer to fastaGraphicProfile
     */
    console.log('CumulusSourceLayer');
    console.log('CumulusSourceLayer id: ' + id);
    console.log('CumulusSourceLayer urlParams: ' + urlParams);

    // if (!layerData) {return};
    if (hasFetched.current) {
      console.log('CumulusSourceLayer skipping, already fetched id:' + id);
      return;
    }
    if (layerCache[id]['source'] !== 'cumulus') {
      console.log('CumulusSourceLayer skipping, source not cumulus id:' + id);
      return;
    }
    const visible = false;

    const maxZoom = 4;
    const zIndex = 6;

    /*
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
    */

    if (!url) {
      console.log('CumulusSourceLayer missing url for id:' + id);
      return;
    }
    if (!extent) {
      console.log('CumulusSourceLayer missing extent for id:' + id);
      return;
    }

    console.log('CumulusSourceLayer creating ImageLayer id:' + id);

    const imgLayer = new ImageLayer({
      source: new ImageStatic({
        url: url,
        imageExtent: extent,
        //projection: display_crs,
      }),
      opacity: 0.75,
    });

    hasFetched.current = true;

    imgLayer.setZIndex(zIndex);
    const map = openLayersMap.map;
    map.addLayer(imgLayer);

    // 2025-01-07 : I'm removing the postrender event handler and updating the
    // cache as soon as the layer is added to the map.
    // Could do with a way to flag that we've finished adding layers.
    //map.once('postrender', (event) => {
    const toCache: Ingest = {
      id: id,
      source: 'cumulus',
      ol_uid: getUid(imgLayer),
    };

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
