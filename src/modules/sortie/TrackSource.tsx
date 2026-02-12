import React, { useEffect, useState, useRef } from 'react';

import TrackLayer from './TrackLayer';
import TrackFeature from './TrackFeature';
import { selectFlightPlan } from './sortieSlice';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, request, remove } from '../../mapping/cacheSlice';
import { v4 as uuidv4 } from 'uuid';

import { type RoutineJson } from './lib/io/types';

const TrackSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const flightPlan = useSelector(selectFlightPlan);
  const [layerId, setLayerId] = useState<string>('');
  const layerInitialised = useRef<boolean>(false);
  const [features, setFeatures] = useState<React.ReactNode[]>([]);
  const [featureIds, setFeatureIds] = useState<string[]>([]);

  useEffect(() => {
    if (!layerInitialised.current) {
      const uid = uuidv4();
      const toRequest = {
        id: uid,
        source: sourceIdentifier + '-layer',
      };
      dispatch(request(toRequest));
      setLayerId(uid);
      layerInitialised.current = true;
    }
  }, []);

  useEffect(() => {
    const layerCacheEntry = cache[layerId];
    if (layerCacheEntry && layerCacheEntry.ol_uid) {
      const tracks: {id: string, waypoints: string[]}[] = [];
      flightPlan.forEach((routine: RoutineJson) => {
        const waypoint0 = routine.waypoint0;
        const waypoint1 = routine.waypoint1;
        if (
          waypoint0 &&
          waypoint1 &&
          waypoint0 != waypoint1 &&
          routine.routine != 'NullRoutine') {
          tracks.push({
            id: routine.id,
            waypoints: [waypoint0, waypoint1]
          })
        } else {
          void(0);// no waypoints
        }
      });
      tracks.forEach((track) => {
        const cacheEntry = cache[track.id];
        if (!cacheEntry) {
          const toRequest = {
            ...track,
            source: sourceIdentifier,
          };
          dispatch(request(toRequest));
        }
      })

      const newIds = tracks.map((track) => track.id);
      const idsToRemove = featureIds.filter((id) => !newIds.includes(id))
      idsToRemove.forEach((id) => dispatch(remove({id: id})))
      setFeatureIds(newIds);
    }
  }, [flightPlan, layerId]);

  useEffect(() => {
    const filteredIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      const source = element.source;
      return source === sourceIdentifier;
    });
    const components = filteredIds.map((id) => (
      <TrackFeature key={id} id={id} layerId={layerId} />
    ));

    // setLayers with these new components
    setFeatures(components);
  }, [cache]);

  // render layers
  return <TrackLayer key={layerId} id={layerId}>{features}</TrackLayer>;
};
export default TrackSource;
