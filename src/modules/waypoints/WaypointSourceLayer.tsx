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
  filteredCache,
} from '../../mapping/cacheSlice';

import { selectDisplayTime, selectVerticalLevel } from '../../mapping/mapSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { LongitudeLatitude } from './waypointSlice';

export interface Waypoint extends Pending {
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
  const waypoints = useSelector(filteredCache(isWaypoint));
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const [layerData, setLayerData] = useState<Waypoint | null>();
  const [coordinates, setCoordinates] = useState<LongitudeLatitude | null>();
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);

  useEffect(() => {
    if (layerData) return;
    setLayerData(waypoints[id]);
  }, [waypoints]);

  useEffect(() => {
    if (!layerData) return;
    if (layerData['source'] !== sourceIdentifier) {
      return;
    }
    if (isEntry(layerData)) return;
    setCoordinates({
      longitude: layerData.longitude,
      latitude: layerData.latitude,
    });
  }, [layerData]);

  useEffect(() => {
    // Return if map, layerData or coords not available return
    if (!map) return;
    if (!layerData) return;
    if (!coordinates) return;

    // Generate an Openlayers Point geometry for coordinates
    const point = new Point(
      fromLonLat([coordinates.longitude, coordinates.latitude]),
    );

    // Generate OpenLayers Feature for Point
    const feature = new Feature({
      geometry: point,
    });

    // Generate OpenLayers VectorSource
    const vectorSource = new VectorSource({
      features: [feature],
    });

    // Generate OpenLayers VectorLayers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 30,
      visible: false,
    });

    // Add layer to map
    map.addLayer(vectorLayer);
    dispatch(ingest({ ...layerData, id: id, ol_uid: getUid(vectorLayer) }));
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [coordinates]);

  return <div></div>;
};

export default WaypointSourceLayer;
