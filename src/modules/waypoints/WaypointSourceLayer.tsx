import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import Map from 'ol/Map';
import OLVectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { get, fromLonLat } from 'ol/proj';
import { getUid } from 'ol/util';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectCache,
  Cache,
  ingest,
  Ingest,
  Pending,
  isPending,
  Entry,
  isEntry,
  CacheElement,
} from '../../mapping/cacheSlice';

import { selectDisplayTime, selectVerticalLevel } from '../../mapping/mapSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { LongitudeLatitude } from './waypointSlice';

interface Waypoint extends Pending {
  longitude: number;
  latitude: number;
  time: string;
  verticalLevel: string;
  dataSource?: string;
  dataType?: string;
  dataValue?: string;
  dataVariable?: string;
  dataUnit?: string;
}

export const isWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return (
    isPending(element) &&
    keys.includes('latitude') &&
    keys.includes('longitude') &&
    keys.includes('time') &&
    keys.includes('verticalLevel')
  );
};

interface Props {
  id: string;
  sourceIdentifier: string;
}

const WaypointSourceLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const [layerData, setLayerData] = useState<CacheElement | null>();
  const [coordinates, setCoordinates] = useState<LongitudeLatitude | null>();
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);

  useEffect(() => {
    console.log(cache);
    setLayerData(cache[id]);
  }, [cache]);

  useEffect(() => {
    if (!layerData) return;
    if (isEntry(layerData)) return;
    if (layerData['source'] !== sourceIdentifier) {
      return;
    }
    if (isWaypoint(layerData)) {
      setCoordinates({
        longitude: layerData.longitude,
        latitude: layerData.latitude,
      });
    }
  }, [layerData]);

  useEffect(() => {
    if (!map) {
      return;
    }
    console.log(coordinates);
    if (!layerData) return;
    if (!coordinates) {
      return;
    }
    const point = new Point(
      fromLonLat([coordinates.longitude, coordinates.latitude]),
    );
    const feature = new Feature({
      geometry: point,
    });
    // Create a vector source and layer to hold the features
    const vectorSource = new VectorSource({
      features: [feature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 20,
      visible: false,
    });

    console.log('hi');

    map.addLayer(vectorLayer);
    dispatch(ingest({ ...layerData, id: id, ol_uid: getUid(vectorLayer) }));
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [coordinates]);

  return <div></div>;
};

export default WaypointSourceLayer;
