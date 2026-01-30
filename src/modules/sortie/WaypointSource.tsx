import React, { useEffect, useState, useRef } from 'react';

import WaypointLayer from './WaypointLayer';
import WaypointFeature from './WaypointFeature';
import { selectWaypoints } from './sortieSlice';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, request } from '../../mapping/cacheSlice';
import { v4 as uuidv4 } from 'uuid';

const WaypointSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const waypoints = useSelector(selectWaypoints);
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
    };
  }, []);

  useEffect(() => {
    const layerCacheEntry = cache[layerId];
    if (layerCacheEntry && layerCacheEntry.ol_uid) {
      waypoints.forEach((waypoint) => {
        const id = `${sourceIdentifier}-${waypoint.id}`;
        const cacheEntry = cache[id];
        if (!cacheEntry) {
          const toRequest = {
            name: waypoint.name,
            latitude: waypoint.latitude.value,
            longitude: waypoint.longitude.value,
            id: id,
            source: sourceIdentifier,
          };
          dispatch(request(toRequest));
        }
      })
    }
  }, [waypoints, layerId, cache]);

  useEffect(() => {
    const filteredIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      const source = element.source;
      return id.includes(sourceIdentifier) && source === sourceIdentifier;
    });
    const components = filteredIds.map((id) => (
      <WaypointFeature key={id} id={id} layerId={layerId} />
    ));

    // setLayers with these new components
    setFeatures(components);
  }, [cache]);

  // render layers
  return <WaypointLayer id={layerId}>{features}</WaypointLayer>;
};
export default WaypointSource;
