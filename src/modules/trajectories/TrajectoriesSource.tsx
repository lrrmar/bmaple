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
  appendWaypointToCurrentTrajectory,
  newTrajectory,
  selectCurrentTrajectory,
  selectCurrentTrajectoryId,
} from './trajectoriesSlice';

import TrajectoryLayer from './TrajectoryLayer';
interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const TrajectoriesSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const [allWaypoints, setAllWaypoints] = useState<string[]>([]);
  const [newWaypoints, setNewWaypoints] = useState<string[]>([]);
  const allCache = useSelector(selectCache);
  const currentTrajectory = useSelector(selectCurrentTrajectory);
  const currentTrajectoryId = useSelector(selectCurrentTrajectoryId);

  useEffect(() => {
    // On inital load create 'init' trajectory array, this is a place holder. Normally this will be done
    // via a click on 'new trajectory' button.
    dispatch(newTrajectory('init'));
  }, []);

  useEffect(() => {
    // Get new waypoints that have been added to the cache
    const cacheWaypointIds = Object.keys(allCache).filter(
      (key) => allCache[key]['source'] === 'waypoints',
    );
    const newWaypointIds = cacheWaypointIds.filter(
      (id) => !allWaypoints.includes(id),
    );
    if (newWaypointIds.length > 0) {
      setNewWaypoints(newWaypointIds);
      setAllWaypoints(cacheWaypointIds);
    }
  }, [allCache]);

  useEffect(() => {
    // Once new waypoints added to cache, append to current trajectory if it exists
    if (currentTrajectory) {
      newWaypoints.forEach((waypoint) =>
        dispatch(appendWaypointToCurrentTrajectory(waypoint)),
      );
    }
  }, [newWaypoints]);

  useEffect(() => {
    if (currentTrajectory && currentTrajectoryId) {
      /*for (let i = 0; i < currentTrajectory.length - 1; i++) {
        const uid = 'segment_' + new Date().getTime();
        console.log(currentTrajectory[i]);
        console.log(currentTrajectory[i + 1]);
        dispatch(
          request({
            source: sourceIdentifier,
            id: uid,
            startWaypoint: currentTrajectory[i],
            endWaypoint: currentTrajectory[i + 1],
          }),
        );
      }*/
      dispatch(
        request({
          source: sourceIdentifier,
          id: currentTrajectoryId,
          //startWaypoint: currentTrajectory[i],
          //endWaypoint: currentTrajectory[i + 1],
          waypoints: currentTrajectory,
        }),
      );
    }
  }, [currentTrajectory]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return (
      <TrajectoryLayer key={id} id={id} sourceIdentifier={sourceIdentifier} />
    );
  });

  return <div className="TrajectoriesSource">{sourcesToLoad}</div>;
};

export default TrajectoriesSource;
