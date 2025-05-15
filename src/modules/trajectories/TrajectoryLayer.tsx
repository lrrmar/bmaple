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
} from '../../mapping/cacheSlice';

import { selectDisplayTime, selectVerticalLevel } from '../../mapping/mapSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { LongitudeLatitude } from '../waypoints/waypointSlice';
import {
  Waypoint,
  isPendingWaypoint,
  isEntryWaypoint,
} from '../waypoints/WaypointSourceLayer';

export interface Trajectory extends Pending {
  waypoints: string[];
  name: string;
}

export const isTrajectory = (element: any): element is Trajectory => {
  const keys: string[] = Object.keys(element);
  return (isPending(element) || isEntry(element)) && keys.includes('waypoints');
};

interface Props {
  id: string;
  sourceIdentifier: string;
}

const TrajectoryLayer = ({ id, sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [layerData, setLayerData] = useState<CacheElement | null>();
  const [coordinates, setCoordinates] = useState<LongitudeLatitude[]>([]);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);

  useEffect(() => {
    setLayerData(cache[id]);
  }, [cache]);

  useEffect(() => {
    const layerData: CacheElement | null = cache[id];
    if (!layerData) return;
    //if (isEntry(layerData)) return;
    if (layerData['source'] !== sourceIdentifier) {
      return;
    }
    if (isTrajectory(layerData)) {
      const waypointIds = layerData.waypoints;
      const waypointCoordinates: LongitudeLatitude[] = [];
      waypointIds.forEach((id: string) => {
        const waypoint = cache[id];
        if (
          waypoint &&
          (isPendingWaypoint(waypoint) || isEntryWaypoint(waypoint))
        ) {
          waypointCoordinates.push({
            latitude: waypoint.latitude,
            longitude: waypoint.longitude,
          });
        }
      });

      if (waypointCoordinates.length < 2) return;
      // Catch change to coordinates stored locally
      if (coordinates.length !== waypointCoordinates.length) {
        setCoordinates(waypointCoordinates);
      } else {
        for (let i = 0; i < waypointCoordinates.length; i++) {
          const oldCoords = coordinates[i];
          const newCoords = waypointCoordinates[i];

          if (
            oldCoords.latitude !== newCoords.latitude ||
            oldCoords.longitude !== newCoords.longitude
          ) {
            setCoordinates(waypointCoordinates);
          }
        }
      }
    }
  }, [cache]);

  useEffect(() => {
    const layerData = cache[id];
    if (!map) {
      return;
    }
    if (!layerData || coordinates.length < 1) return;
    const lineStringCoords = coordinates.map((coordinate) =>
      fromLonLat([coordinate.longitude, coordinate.latitude]),
    );
    const lineString = new LineString(lineStringCoords);
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
    dispatch(ingest({ ...layerData, id: id, ol_uid: getUid(vectorLayer) }));
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [coordinates]);

  return <div></div>;
};

export default TrajectoryLayer;
