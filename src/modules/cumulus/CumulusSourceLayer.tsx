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

  // Map from: https://dev.fastaweather.com/api/v1/onset/doy/2025/02/04/44/
  // To: https://cumulusstorageaccount1.blob.core.windows.net/data/2025_Ghana_onset/20250501/forecast_status_20250501_onset_day_of_year_entry039.geojson

  // doy/2025/02/04/44/
  // 20250501/forecast_status_20250501_onset_day_of_year_entry039.geojson

  console.log('CumulusSourceLayer id: ' + id);

  const urlParams = id.split('?');

  console.log('CumulusSourceLayer urlParams: ' + urlParams);

  // Map API-style parameters to an Azure blob subpath and full blob URL.
  // Example input `urlParams` array: ["doy", "2025/02/01", "25"]
  // Produces subpath: "20250201/forecast_status_20250201_onset_day_of_year_entry_025.geojson"
  // If the 3rd element is exactly "0" then the filename uses "onset_status" instead of "forecast_status".
  const mapParamsToBlobUrl = (
    params: string[],
    storageHost: string,
    // optional prefix path inside the container (e.g. "data/2025_Ghana_onset")
    containerPrefix = '',
  ) => {
    const [type, datePart, entryPart] = params;
    // Normalize date like "2025/02/01" -> "20250201"
    const ymd = (datePart || '').replace(/\//g, '');
    const entry = (entryPart || '0').toString().padStart(3, '0');
    const prefix = entryPart === '0' ? 'onset_status' : 'forecast_status';
    const infix = type === 'days' ? 'rain_days_ago' : 'onset_day_of_year';
    const filename = `${prefix}_${ymd}_${infix}_entry${entry}.geojson`;
    const subpath = `${ymd}/${filename}`;
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
