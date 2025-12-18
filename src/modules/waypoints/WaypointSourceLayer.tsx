import React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';

import Map from 'ol/Map';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
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

import {
  selectDisplayTime,
  selectVerticalLevel,
  updateErrorMessage,
} from '../../mapping/mapSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { LongitudeLatitude } from './waypointSlice';
import { selectCurrentTrajectory } from '../trajectories/trajectoriesSlice';

export interface Waypoint extends Pending {
  longitude: number;
  latitude: number;
  time: string;
  verticalLevel: string;
  name: string;
  id: string;
  features: string[];
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
  const currentTrajectory = useSelector(selectCurrentTrajectory);
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
      return 'Above Sea'; //`${lat.toFixed(2)},${lon.toFixed(2)}`;
    } catch (error) {
      return 'Above Sea'; //`${lat.toFixed(2)},${lon.toFixed(2)}`;
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
        waypoint.name = 'Above Sea'; //`${waypoint.latitude.toFixed(2)},${waypoint.longitude.toFixed(2)}`;
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

    // Check for geometry conflicts with other layers e.g. inside flyable
    // region
    const mapUtils = new OpenLayersMap();
    let conflictCacheEntries: CacheElement[] = [];
    const conflictFeatureOlUids = layerData.conflictingFeatures;
    console.log(conflictFeatureOlUids);
    if (
      conflictFeatureOlUids &&
      conflictFeatureOlUids instanceof Array &&
      conflictFeatureOlUids.length > 0
    ) {
      const filteredCache = Object.values(cache).filter(
        (entry) => 'features' in entry,
      );

      // Get the cache entries that represent the layers holding each feature
      const cacheEntries = conflictFeatureOlUids.map((ol_uid) => {
        if (typeof ol_uid === 'string') {
          const conflictCacheEntries = Object.values(filteredCache).filter(
            (entry) => {
              const features = entry.features;
              if (features instanceof Array && features.length > 0) {
                if (features.includes(ol_uid)) {
                  return true;
                }
              } else {
                return false;
              }
            },
          );
          return conflictCacheEntries[0]; // Hack, check for errors
        }
      });
      conflictCacheEntries = cacheEntries.filter((entry) => !!entry);
    }
    const conflictIds = conflictCacheEntries.map((entry) => entry.id);

    const errorMessages = new Set<string>();

    if (!conflictIds.includes('faam-ring') && currentTrajectory) {
      // Onlydo this check if we are interacting with a trajectory
      errorMessages.add('Outside flight range');
    }

    conflictCacheEntries.forEach((entry) => {
      const id = entry.id;
      if (id.includes('nats-danger')) {
        const lower = entry['lower limit'];
        const upper = entry['upper limit'];
        if (
          lower !== null &&
          lower !== undefined &&
          upper &&
          verticalLevel &&
          lower <= verticalLevel &&
          verticalLevel <= upper
        ) {
          errorMessages.add('Danger area');
        }
      }
    });

    conflictIds.forEach((id) => {
      if (id.includes('waypoint')) {
        errorMessages.add(
          'Waypoint already present - duplicate for different time',
        );
      }
    });

    if (errorMessages.size > 0) {
      dispatch(updateErrorMessage([...errorMessages][0]));
    } else {
      dispatch(updateErrorMessage(null));
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
        features: [getUid(feature)],
        ol_uid: getUid(vectorLayer),
      };
      if (isEntryWaypoint(waypoint)) getClosestSettlementAndIngest(waypoint);
      return () => {
        map.removeLayer(vectorLayer);
      };
    }
  }, [coordinates]);

  return <div></div>;
};

export default WaypointSourceLayer;
