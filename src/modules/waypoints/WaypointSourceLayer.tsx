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
  Action,
  Generic,
  CacheElement,
} from '../../mapping/cacheSlice';

import { selectDisplayTime, selectVerticalLevel } from '../../mapping/mapSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { LongitudeLatitude } from './waypointSlice';

export interface Waypoint extends Pending {
  longitude: number;
  latitude: number;
  time: string;
  verticalLevel: string;
  name: string;
  dataSource?: string;
  dataType?: string;
  dataValue?: string;
  dataVariable?: string;
  dataUnit?: string;
}
export interface EntryWaypoint extends Waypoint {
  id: string;
}
export const isPendingWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return (
    isPending(element) &&
    keys.includes('latitude') &&
    keys.includes('longitude') &&
    keys.includes('time') &&
    keys.includes('verticalLevel')
  );
};

export const isEntryWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return (
    isEntry(element) &&
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
  const [coordinates, setCoordinates] = useState<LongitudeLatitude | null>(
    null,
  );
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);

  async function apiCall(
    lat: number,
    lon: number,
  ): Promise<string | undefined> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your@email.com)',
        },
      });
      const data = await response.json();
      if (data.address) {
        // Prioritize known settlement types
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          data.address.county
        );
      }
      return `${lat.toFixed(2)},${lon.toFixed(2)}`;
    } catch (error) {
      return `${lat.toFixed(2)},${lon.toFixed(2)}`;
    }
  }

  async function getClosestSettlementAndIngest(
    waypoint: Waypoint & Ingest,
  ): Promise<void> {
    const name = waypoint.name;
    if (name && !(name === '')) {
      // Name already defined
      dispatch(ingest(waypoint));
      return;
    }
    await apiCall(waypoint.latitude, waypoint.longitude).then((settlement) => {
      if (settlement) {
        waypoint.name = settlement;
      } else {
        waypoint.name = `${waypoint.latitude.toFixed(2)},${waypoint.longitude.toFixed(2)}`;
      }
      dispatch(ingest(waypoint));
    });
  }

  useEffect(() => {
    setLayerData(cache[id]);
  }, [cache]);

  useEffect(() => {
    // Assess what to do with incoming layer data
    if (!layerData) return;

    // Wrong source
    if (layerData['source'] !== sourceIdentifier) {
      return;
    }
    // check for updates
    if (isEntryWaypoint(layerData) && coordinates) {
      const newLatitude = layerData.latitude;
      const newLongitude = layerData.longitude;
      if (
        newLatitude !== coordinates.latitude ||
        newLongitude !== coordinates.longitude
      ) {
        setCoordinates({
          longitude: layerData.longitude,
          latitude: layerData.latitude,
        });
      }
    }

    if (isPendingWaypoint(layerData)) {
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
      zIndex: 30,
      visible: false,
    });

    map.addLayer(vectorLayer);
    const waypoint: Generic & Entry & Action = {
      ...layerData,
      id: id,
      ol_uid: getUid(vectorLayer),
    };
    if (isEntryWaypoint(waypoint)) getClosestSettlementAndIngest(waypoint);
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [coordinates]);

  return <div></div>;
};

export default WaypointSourceLayer;
