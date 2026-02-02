import React, { useEffect, useState, useRef } from 'react';

import TrackLayer from './TrackLayer';
import TrackFeature from './TrackFeature';
import { selectFlightPlan } from './sortieSlice';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, request, update } from '../../mapping/cacheSlice';
import { v4 as uuidv4 } from 'uuid';

const TrackSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const flightPlan = useSelector(selectFlightPlan);
  const [layerId, setLayerId] = useState<string>('');
  const layerInitialised = useRef<boolean>(false);
  const [features, setFeatures] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!layerInitialised.current) {
      const uid = uuidv4();
      const toRequest = {
        id: uid,
        source: sourceIdentifier,
      };
      dispatch(request(toRequest));
      setLayerId(uid);
      layerInitialised.current = true;
    }
  }, []);

  useEffect(() => {
    const layerCacheEntry = cache[layerId];
    if (layerCacheEntry && layerCacheEntry.ol_uid) {
      const id = `${sourceIdentifier}`;
      const cacheEntry = cache[id];
      const waypoints: string[] = [];
      flightPlan.forEach((routine) => {
        const waypoint0 = routine.waypoint0;
        const waypoint1 = routine.waypoint1;
        if (waypoint0) {
          if (waypoints.length == 0) waypoints.push(waypoint0);
        }
        if (waypoint1) waypoints.push(waypoint1);
      });
      if (!cacheEntry) {
        const toRequest = {
          waypoints: waypoints,
          id: id,
          source: sourceIdentifier,
        };
        dispatch(request(toRequest));
      } else {
        const toUpdate = {
          waypoints: waypoints,
          id: id,
        };
        dispatch(update(toUpdate));
      }
    }
  }, [flightPlan, layerId, cache]);

  useEffect(() => {
    const filteredIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      const source = element.source;
      return id.includes(sourceIdentifier) && source === sourceIdentifier;
    });
    const components = filteredIds.map((id) => (
      <TrackFeature key={id} id={id} layerId={layerId} />
    ));

    // setLayers with these new components
    setFeatures(components);
  }, [cache]);

  // render layers
  return <TrackLayer id={layerId}>{features}</TrackLayer>;
};
export default TrackSource;
