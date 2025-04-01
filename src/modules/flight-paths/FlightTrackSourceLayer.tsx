import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import Map from 'ol/Map';
import OLVectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { get, fromLonLat } from 'ol/proj';
import { getUid } from 'ol/util';
import { useDispatch, useSelector } from 'react-redux';

// TEMP
import { Style, Stroke, Circle, Fill, RegularShape } from 'ol/style';
////////////////////////////
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
import { LongitudeLatitude } from '../waypoints/waypointSlice';
import { isWaypoint } from '../waypoints/WaypointSourceLayer';

export interface FlightTrack extends Entry {
  startWaypoint: string;
  endWaypoint: string;
}

export const isFlightTrack = (element: any): element is FlightTrack => {
  const keys: string[] = Object.keys(element);
  return keys.includes('startWaypoint') && keys.includes('endWaypoint');
};

interface Props {
  id: string;
  sourceIdentifier: string;
}

const FlightTrackSourceLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const waypoints = useSelector(filteredCache(isWaypoint));
  const flightTracks = useSelector(filteredCache(isFlightTrack));
  const layerData: React.MutableRefObject<FlightTrack | null> = useRef(null);
  const [startCoordinates, setStartCoordinates] =
    useState<LongitudeLatitude | null>();
  const [endCoordinates, setEndCoordinates] =
    useState<LongitudeLatitude | null>();
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);

  useEffect(() => {
    if (layerData.current) return;
    layerData.current = flightTracks[id];
  }, [flightTracks]);

  useEffect(() => {
    if (!layerData.current) return;
    if (layerData.current['source'] !== sourceIdentifier) {
      return;
    }
    if (isFlightTrack(layerData.current)) {
      const startWaypointId = layerData.current.startWaypoint;
      const endWaypointId = layerData.current.endWaypoint;
      if (
        startWaypointId &&
        endWaypointId &&
        typeof startWaypointId == 'string' &&
        typeof endWaypointId == 'string' &&
        waypoints[startWaypointId] &&
        waypoints[endWaypointId]
      ) {
        const startWaypoint = waypoints[startWaypointId];
        const endWaypoint = waypoints[endWaypointId];

        setStartCoordinates({
          latitude: startWaypoint.latitude,
          longitude: startWaypoint.longitude,
        });

        setEndCoordinates({
          latitude: endWaypoint.latitude,
          longitude: endWaypoint.longitude,
        });
      }
    }
  }, [layerData]);

  useEffect(() => {
    if (!map) {
      return;
    }
    if (!layerData.current || !startCoordinates || !endCoordinates) return;
    const lineString = new LineString([
      fromLonLat([startCoordinates.longitude, startCoordinates.latitude]),
      fromLonLat([endCoordinates.longitude, endCoordinates.latitude]),
    ]);
    const feature = new Feature({
      geometry: lineString,
    });
    // Create a vector source and layer to hold the features
    const vectorSource = new VectorSource({
      features: [feature],
    });

    const style = new Style({
      stroke: new Stroke({
        color: '#000000',
        width: 1.5,
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 29,
      visible: true,
      style: style,
    });

    map.addLayer(vectorLayer);
    dispatch(
      ingest({ ...layerData.current, id: id, ol_uid: getUid(vectorLayer) }),
    );
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [startCoordinates, endCoordinates]);

  return <div></div>;
};

export default FlightTrackSourceLayer;
