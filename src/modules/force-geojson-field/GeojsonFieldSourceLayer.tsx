import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import OLVectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import { get } from 'ol/proj';
import MapType from 'ol/Map';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { ingest, Ingest } from '../../mapping/cacheSlice';
import { updateProfileId } from './geojsonFieldSlice';

type Properties = {
  [key: string]: Properties | string[] | string | number[] | number;
};

interface LayerProperties extends Properties {
  levels: { [key: string]: string[] | number[] };
}
interface FeatureProperties extends Properties {
  level: string | number;
}

interface Json {
  [key: string]: string | number | string[] | number[] | Json;
}

//API to fetch from Server
const apiCall = async (id: string) => {
  const response = await fetch(`http://localhost:8080/layerById?id=${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const data = await response.json();
  return data;
};

interface Props {
  id: string;
  sourceIdentifier: string;
}

const WrfSourceLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const [layerData, setLayerData] = useState<Json | null>(null);
  const [layerProperties, setLayerProperties] =
    useState<LayerProperties | null>(null);
  const [map, setMap] = useState<MapType | null>(OpenLayersMap.map);
  const hasFetched = useRef(false);

  const fetchLayerData = async (id: string) => {
    /* async function to wrap api call and add response to state (layerData) */
    try {
      const data = await apiCall(id);
      if (data) {
        const properties = { ...data };
        delete properties.features;
        setLayerProperties(properties);
        setLayerData(data);
      }
    } catch (error) {}
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
    if (!layerData) {
      return;
    }
    if (!map) {
      return;
    }
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(layerData, {
        featureProjection: 'EPSG:3857',
      }),
    });
    // Add extra metadata to features
    if (!layerProperties) {
      return;
    }
    vectorSource.getFeatures().map((feature) => {
      const originalProps: FeatureProperties = {
        level: 0,
        ...feature.getProperties(),
      };
      const newProps: Properties = {
        ...originalProps,
        source: sourceIdentifier,
      };
      if (layerProperties['levels']) {
        const levels = layerProperties['levels'];
        const levelKey: string =
          typeof originalProps.level === 'string'
            ? originalProps.level
            : originalProps.level.toString();
        newProps['contourRange'] = levels[levelKey];
      }
      if (layerProperties['varname']) {
        newProps['variable'] = layerProperties['varname'];
      }
      if (layerProperties['units']) {
        newProps['units'] = layerProperties['units'];
      }
      feature.setProperties(newProps);
    });
    const vectorLayer = new OLVectorLayer({
      source: vectorSource,
    });
    vectorLayer.setVisible(false);
    const add = map.addLayer(vectorLayer);

    map.once('postrender', (event) => {
      const properties = { ...layerData };
      delete properties.features;
      const ol_uid: string | null = vectorLayer.getProperties().ol_uid;
      // Big error... how can we handle?
      if (!ol_uid) return;
      const toCache = {
        id: id,
        ol_uid: ol_uid,
        source: sourceIdentifier,
        ...properties,
      };

      dispatch(ingest(toCache));
      dispatch(updateProfileId(id));
    });
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [layerData]);

  return <div></div>;
};

export default WrfSourceLayer;
