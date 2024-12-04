import React, { useEffect, useState, useRef, useMemo } from 'react';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { get } from 'ol/proj';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '../../hooks';
import {
  swapLayers,
  clearLayers,
  fetchVariables,
  updatePositioning,
  selectBackendVariables,
  selectRequestStatus,
  selectPositioning,
  selectFastaLayerId,
  selectFastaSourceLoad,
  selectFastaBaseUrl,
  selectLayerCache,
  cacheLayer,
  requestLayerToCache,
  updateFastaGraphicProfileId,
} from '../mapSlice';
import mapObject from '../OLMap.js';

import FastaHashTablesServer from './FastaHashTables';

// API to fetch from Server
const apiCall = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const FastaSourceLayer = ({ id: string }) => {
  const dispatch = useDispatch();
  const fastaBaseUrl = useSelector(selectFastaBaseUrl);
  const layerCache = useSelector(selectLayerCache);

  const urlParams = id.split('?');
  let forecastQs = '';
  if (urlParams[1]) {
    forecastQs = 'forecast=' + urlParams[1] + '&';
  }
  const [url, setUrl] = useState(
    `https://${fastaBaseUrl}/api/v1/vts/${id.split('?')[0]}/{z}/{x}/{y}.pbf?${forecastQs}token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0`,
  );
  //const [url, setUrl] = useState(`https://${fastaBaseUrl}/api/v1/vts/crr/now/{z}/{x}/{y}.pbf?token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0`)
  const map = mapObject.getInstance();
  const hasFetched = useRef(false);

  const fetchLayerData = async (id) => {
    /* async function to wrap api call and add response to state (layerData) */
    try {
      const data = await apiCall(id);
      if (data) {
        setLayerData(data);
        const properties = { ...data };
        delete properties.features;
      }
    } catch (error) {}
  };

  //    useEffect(() => {
  /* populate layerData, checking against data source and if has fetched.
   */
  //        if (hasFetched.current) {return};
  //        if (layerCache[id]['source'] !== 'fasta') {return};
  //        hasFetched.current = true;
  //fetchLayerData(id);
  //    }, []);

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

    console.log('FASTASourceLayer creating VectorTileLayer id:' + id);

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

    // TODO : RDT line and fill layers
    // map.addLayer({
    //    'id': 'rdt_vector_' + idx,
    //    'type': 'fill',  ... etc
    // map.setFilter('rdt_vector_' + idx, ['==', 'object_type', 'cell-000']);
    // map.addLayer({
    //    'id': 'rdt_vector_' + idx + '_line',
    //    'type': 'line',
    //    'layout': {  'line-cap': 'round', 'line-join': 'round' } ... etc

    // NEED TO CATCH 404

    const map = mapObject.getInstance();
    map.addLayer(vtLayer);
    map.once('postrender', (event) => {
      const toCache = {
        id: id,
        ol_uid: vtLayer.ol_uid,
      };

      dispatch(cacheLayer(toCache));
      setTimeout(() => {
        vtLayer.setExtent(null); // Reset to allow loading dynamically later
      }, 3000);
      //dispatch(updateFastaGraphicProfileId(id));
    });
    /*return () => {
            map.removeLayer();
        };*/
  }, []);

  return null;
};

export default FastaSourceLayer;
