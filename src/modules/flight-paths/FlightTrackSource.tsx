import React, { useEffect, useState } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import {
  selectCache,
  CacheElement,
  Cache,
  Request,
  request,
  Generic,
} from '../../mapping/cacheSlice';

import {
  selectClickEvent,
  selectFeaturesAtClick,
  selectDisplayTime,
  FeatureAtClick,
} from '../../mapping/mapSlice';

import { selectVerticalLevel } from '../force-geojson-field/geojsonFieldSlice';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import FlightTrackSourceLayer from './FlightTrackSourceLayer';
import { Waypoint } from '../waypoints/WaypointSourceLayer';
interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const FlightTrackSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const [waypoints, setWaypoints] = useState<Cache>({});
  const trajectoryId = 0; // useSelector here in future
  const [trajectoryLookUp, setTrajectoryLookUp] = useState<{
    [key: string]: number;
  }>({});
  const allCache = useSelector(selectCache);

  useEffect(() => {
    // Get waypoints everytime cache is updated
    const waypointIds = Object.keys(allCache).filter(
      (key) => allCache[key]['source'] === 'waypoints',
    );
    const newWaypoints: Cache = {};
    waypointIds.forEach((id) => (newWaypoints[id] = allCache[id]));
    setWaypoints(newWaypoints);
  }, [allCache]);

  useEffect(() => {
    // tag new waypoints with trajectory id in trajectoryLookUp
    const newWaypointIds = Object.keys(waypoints).filter(
      (id) => !Object.keys(trajectoryLookUp).includes(id),
    );
    if (newWaypointIds.length > 0) {
      const newTrajectoryLookUp = trajectoryLookUp;
      newWaypointIds.forEach((id) => (newTrajectoryLookUp[id] = trajectoryId));
      setTrajectoryLookUp((trajectoryLookUp) => ({
        ...trajectoryLookUp,
        ...newTrajectoryLookUp,
      }));
    }
  }, [waypoints]);

  useEffect(() => {
    // order waypoint ids in each trajectory by their
    // time property
    const allTrajectoryIds = [...new Set(Object.values(trajectoryLookUp))];
    const waypointLookUp: { [key: number]: string[] } = {};
    // Init space for each trajectory
    allTrajectoryIds.forEach((id) => (waypointLookUp[id] = []));
    // Fill waypoint look up
    Object.keys(trajectoryLookUp).forEach((waypointId: string) => {
      const trajectoryId = trajectoryLookUp[waypointId];
      waypointLookUp[trajectoryId].push(waypointId);
    });

    // Ordering waypoints in each trajectory in time
    allTrajectoryIds.forEach((id: number) => {
      const waypointIds = waypointLookUp[id];
      waypointIds.sort((a: string, b: string) => {
        // this sort function takes two waypoint IDs, gets their
        // respective 'time' properties via the cache
        const cacheEntryA: CacheElement = allCache[a];
        const cacheEntryB: CacheElement = allCache[b];
        if (
          cacheEntryA.time &&
          cacheEntryB.time &&
          typeof cacheEntryA.time == 'string' &&
          typeof cacheEntryB.time == 'string'
        ) {
          const aTime = new Date(cacheEntryA.time);
          const bTime = new Date(cacheEntryB.time);
          if (aTime < bTime) {
            return -1;
          }
          if (aTime > bTime) {
            return 1;
          }
        }
        return 0;
      });

      for (let i = 0; i < waypointIds.length - 1; i++) {
        const uid = 'id' + new Date().getTime();
        dispatch(
          request({
            source: sourceIdentifier,
            id: uid,
            startWaypoint: waypointIds[i],
            endWaypoint: waypointIds[i + 1],
          }),
        );
      }
    });
  }, [trajectoryLookUp]);

  {
    /*request({
        source: sourceIdentifier,
        mode: mode,
        id: uid,
        ...clickEvent,
        time: displayTime,
        verticalLevel: verticalLevel,
        ...featureData,
      }),
    );
  }, [waypoints]);*/
  }

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return (
      <FlightTrackSourceLayer
        key={id}
        id={id}
        sourceIdentifier={sourceIdentifier}
      />
    );
  });

  return <div className="FlightTrackSource">{sourcesToLoad}</div>;
};

export default FlightTrackSource;
