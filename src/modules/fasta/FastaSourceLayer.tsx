import React, { useEffect, useState, useRef, useMemo } from 'react';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import {getUid} from 'ol/util';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '../../hooks';
import {
  selectCache,
  ingest,
  Ingest
} from '../../mapping/cacheSlice';
import {
  selectBaseUrl,
  updateProfileCrrId,
  updateProfileRdtId,
  selectSelectedCrrId,
  selectSelectedRdtId
} from './fastaSlice';
import openLayersMap from '../../mapping/OpenLayersMap';
import FastaHashTablesServer from './FastaHashTables';

interface Props {
  id: string;
  sourceIdentifier: string;
}

const FastaSourceLayer = ({ id, sourceIdentifier }: Props) => {
 
  const dispatch = useDispatch();
  const fastaBaseUrl = useSelector(selectBaseUrl);
  const layerCache = useSelector(selectCache);
  const selectedCrrRequestId : string = useSelector(selectSelectedCrrId);
  const selectedRdtRequestId : string = useSelector(selectSelectedRdtId);

  const urlParams = id.split('?');
  let forecastQs = '';
  if (urlParams[1]) {
    forecastQs = 'forecast=' + urlParams[1] + '&';
  }
  const [url, setUrl] = useState(
    `https://${fastaBaseUrl}/api/v1/vts/${id.split('?')[0]}/{z}/{x}/{y}.pbf?${forecastQs}token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0`,
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
    if (layerCache[id]['source'] !== 'fasta') {
      return;
    }
    hasFetched.current = true;
    const visible = false;

    console.log('FASTASourceLayer creating VectorTileLayer id:' + id
        + ' sourceId: ' + sourceIdentifier
        + " selectedCrrRequestId: " + selectedCrrRequestId);

    const vtLayer = new VectorTileLayer({
      source: new VectorTileSource({
        maxZoom: 15,
        format: new MVT(),
        url: url,
      }),
      visible: true,
      style: function (feature, resolution) {
        return [];
      },
    });

    const map = openLayersMap.map;
    map.addLayer(vtLayer);

    // 2025-01-07 : I'm removing the postrender event handler and updating the
    // cache as soon as the layer is added to the map.
    // Could do with a way to flag that we've finished adding layers.
    //map.once('postrender', (event) => {

      const toCache : Ingest = {
        id: id,
        source: "fasta",
        ol_uid: getUid(vtLayer),
      };

      //dispatch(cacheLayer(toCache));
      dispatch(ingest(toCache));

      //console.log("Added Ingest to cache: " + id + " : " + toCache.ol_uid);

      setTimeout(() => {
        vtLayer.setExtent(undefined); // Reset to allow loading dynamically later
      }, 3000);
    
    //}); // once

  }, []);

  return null;
};

export default FastaSourceLayer;
