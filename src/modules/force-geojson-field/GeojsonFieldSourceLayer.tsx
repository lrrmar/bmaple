import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import OLVectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import { get } from 'ol/proj';
import { getUid } from 'ol/util';
import MapType from 'ol/Map';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { ingest, Ingest } from '../../mapping/cacheSlice';
import { updateProfileId, selectApiUrl } from './geojsonFieldSlice';

// Generic typing for properties that come out of an openlayers
// feature, TODO pin this down a bit more...
type Properties = {
  [key: string]: Properties | string[] | string | number[] | number;
};

interface GeojsonFeatureProperties extends Properties {
  level: number;
  // ObjectType?: string; TODO
}
interface GeojsonFeatureGeometry {
  coordinates: number[][];
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon'
    | 'GeometryCollection';
}

type GeojsonProperties = {
  levels: { [key: number]: string };
  hex_palette: { [key: number]: string };
  varname: string;
  level_type: string;
  grid_id: string;
  sim_start_time: string;
  valid_time: string;
  units: string;
  grid_spacing?: number;
  grid_units?: string;
  sigma?: number;
};

// For cache typing
export type GeojsonField = GeojsonProperties;

export const isGeojsonField = (element: any): element is GeojsonField => {
  const keys: string[] = Object.keys(element);
  return (
    keys.includes('levels') &&
    keys.includes('varname') &&
    keys.includes('level_type') &&
    keys.includes('grid_id') &&
    keys.includes('sim_start_time') &&
    keys.includes('valid_time') &&
    keys.includes('units')
  );
};

interface GeojsonFeature {
  type: 'Feature';
  properties: GeojsonFeatureProperties;
  geometry: GeojsonFeatureGeometry;
}

interface Geojson {
  type: 'FeatureCollection';
  properties: GeojsonProperties;
  features: GeojsonFeature[];
}

interface Props {
  id: string;
  sourceIdentifier: string;
}

const WrfSourceLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const [layerData, setLayerData] = useState<Geojson | null>(null);
  const [layerProperties, setLayerProperties] =
    useState<GeojsonProperties | null>(null);
  const [map, setMap] = useState<MapType | null>(OpenLayersMap.map);
  const hasFetched = useRef(false);
  const apiUrl = useSelector(selectApiUrl);

  //API to fetch from Server
  const apiCall = async (id: string) => {
    const response = await fetch(`${apiUrl}/layerById?id=${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    return data;
  };

  const fetchLayerData = async (id: string) => {
    /* async function to wrap api call and add response to state (layerData) */
    try {
      const data = await apiCall(id);
      if (data) {
        const properties: GeojsonProperties = data['properties'];
        setLayerProperties(properties);
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
    // When layerData (geojson data) changes, do the following:

    // If no valid layerData, return
    if (!layerData) {
      return;
    }

    //If no access to map, return
    if (!map) {
      return;
    }

    // Generate an openlayers VectorSource using the geojson
    // layerData
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(layerData, {
        featureProjection: 'EPSG:3857',
      }),
    });

    // Add extra metadata to features
    // If no layerProperties, return: IS THIS SORTED BY TYPING GEOJSON
    // MORE STRICTLY????
    if (!layerProperties) {
      return;
    }

    // For each feature (e.g. a polygon) in the VectorSource add the following
    // metadata:
    // - source e.g. 'force-geojson-field'
    // - contour level number (for future styling)
    // - varname
    // - units
    vectorSource.getFeatures().map((feature) => {
      const originalProps: GeojsonFeatureProperties = {
        level: 0,
        ...feature.getProperties(),
      };
      const newProps: Properties = {
        ...originalProps,
        source: sourceIdentifier,
      };
      if (layerProperties['levels']) {
        const levels = layerProperties['levels'];
        newProps['contourRange'] = levels[originalProps.level];
      }
      if (layerProperties['varname']) {
        newProps['variable'] = layerProperties['varname'];
      }
      if (layerProperties['units']) {
        newProps['units'] = layerProperties['units'];
      }
      feature.setProperties(newProps);
    });

    // Generate OpenLayers VectorLayer from the VectorSource
    const vectorLayer = new OLVectorLayer({
      source: vectorSource,
      zIndex: 20,
    });

    // Set layer to be invisible
    vectorLayer.setVisible(false);

    // Add the VectorLayer to the map
    const add = map.addLayer(vectorLayer);

    map.once('postrender', (event) => {
      // Once rendered, push properties to cache
      const ol_uid: string | null = getUid(vectorLayer);
      // Big error... how can we handle?
      if (!ol_uid) return;
      const toCache = {
        id: id,
        ol_uid: ol_uid,
        source: sourceIdentifier,
        ...layerProperties,
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
