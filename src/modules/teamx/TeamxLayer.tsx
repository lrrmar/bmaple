import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import { get } from 'ol/proj';
import { getUid } from 'ol/util';
import MapType from 'ol/Map';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { ingest, Ingest } from '../../mapping/cacheSlice';
import { updateProfileId, selectApiUrl } from './teamxSlice';

// Generic typing for properties that come out of an openlayers
// feature, TODO pin this down a bit more...

interface Props {
  id: string;
  sourceIdentifier: string;
}

const TeamxLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const [map, setMap] = useState<MapType | null>(OpenLayersMap.map);
  const hasFetched = useRef(false);
  const [layerData, setLayerData] = useState<Blob | null>(null);
  const apiUrl =
    'https://gws-access.jasmin.ac.uk/public/mo_forecasts/restricted/TEAMx/img/teamx_ral3p2/'; //useSelector(selectApiUrl);
  const username = 'TEAMx';
  const password = 'Alpine';
  const creds = btoa(`${username}:${password}`);

  //API to fetch from Server
  const apiCall = async (id: string) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${creds}`,
      },
    });
    const data = await response.blob();
    return data;
  };

  const fetchLayerData = async (id: string) => {
    /* async function to wrap api call and add response to state (layerData) */
    try {
      const data = await apiCall(id);
      if (data) {
        setLayerData(data);
      }
    } catch (error) {
      console.log('Error');
    }
  };

  /* FETCHING LAYER DATA */

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;
    fetchLayerData(id);
  }, []);

  /* - CREATE VECTOR LAYER
   * - INGEST INTO CACHE
   * - UPDATE PROFILEID
   */

  useEffect(() => {
    // When layerData changes, do the following:

    // If no valid layerData, return
    if (!layerData) {
      return;
    }

    //If no access to map, return
    if (!map) {
      return;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(layerData);

    // Generate an openlayers VectorSource using the geojson
    // layerData
    const source = new Static({
      url: URL.createObjectURL(layerData),
      imageExtent: [0, 0, 12, 12],
    });

    // Generate OpenLayers VectorLayer from the VectorSource
    const layer = new ImageLayer({
      source: source,
      zIndex: 20,
    });

    // Set layer to be invisible
    layer.setVisible(true);

    // Add the VectorLayer to the map
    const add = map.addLayer(layer);

    map.once('postrender', (event) => {
      // Once rendered, push properties to cache
      const ol_uid: string | null = getUid(layer);
      // Big error... how can we handle?
      if (!ol_uid) return;
      const toCache = {
        // what metadata?
        id: id,
        ol_uid: ol_uid,
        source: sourceIdentifier,
      };

      dispatch(ingest(toCache));
      dispatch(updateProfileId(id));
    });
    return () => {
      map.removeLayer(layer);
    };
  }, [layerData]);

  return <div></div>;
};

export default TeamxLayer;
