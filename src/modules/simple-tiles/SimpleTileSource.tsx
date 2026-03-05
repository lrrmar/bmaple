import React, { useEffect, useState, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  updateDisplayTimes,
  updateVerticalLevels,
  selectIsoDisplayTime,
  selectDisplayTimesIntersection,
  selectVerticalLevel,
} from '../../mapping/mapSlice';

import {
  selectApiUrl,
  selectBackendDiscreteMetaData,
  selectReadableNames,
  selectDiscreteMetaDataSelections,
  selectContinuousMetaDataLocks,
  updateProfileIds,
  selectProfileIds,
  selectSelectedResources,
  BackendDiscreteMetaData,
  updateBackendDiscreteMetaData,
  updateReadableNames,
  DiscreteMetaData,
} from './simpleTileSlice';
import { selectCache, request } from '../../mapping/cacheSlice';

import SimpleTileLayer from './SimpleTileLayer';

interface ContinuousMetaData {
  valid_time: string[];
  start_time: string[];
  level: string[];
}

interface Hash {
  [key: string]: string;
  id: string;
  file: string;
}
interface Query {
  file: string | null;
}
const SimpleTileSource = ({
  sourceIdentifier,
}: {
  sourceIdentifier: string;
}) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const apiUrl = useSelector(selectApiUrl);
  const profileIds = useSelector(selectProfileIds);
  const selectedResources = useSelector(selectSelectedResources);
  const backendDiscreteMetaData = useSelector(selectBackendDiscreteMetaData);
  const readableNames = useSelector(selectReadableNames);
  const discreteMetaDataSelections = useSelector(
    selectDiscreteMetaDataSelections,
  );
  const continuousMetaDataLocks = useSelector(selectContinuousMetaDataLocks);
  const previousSelections = useRef<{ [key: string]: DiscreteMetaData | null }>(
    {},
  );
  const displayTime = useSelector(selectIsoDisplayTime);
  const displayTimes = useSelector(selectDisplayTimesIntersection);
  const verticalLevel = useSelector(selectVerticalLevel);
  const [continuousMetaData, setContinuousMetaData] = useState<{
    [key: string]: ContinuousMetaData | null;
  }>({});
  const [currentHashes, setCurrentHashes] = useState<{ [key: string]: Hash[] }>(
    {},
  );
  const [layers, setLayers] = useState<React.ReactNode[]>([]);
  const [loadedResources, setLoadedResources] = useState<string[]>([]);
  const [preloadIds, setPreloadIds] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    if (profileIds) {
      Object.values(profileIds).forEach((id) => {
        if (id) {
          const cacheElement = cache[id];
          if (!cacheElement)
            dispatch(
              request({
                id: id,
                source: sourceIdentifier,
              }),
            );
        }
      });
    }
  }, [profileIds]);

  useEffect(() => {
    const filteredIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      const source = element.source;
      return source === sourceIdentifier;
    });
    const components = filteredIds.map((id) => (
      <SimpleTileLayer key={id} id={id} sourceIdentifier={sourceIdentifier} />
    ));

    // setLayers with these new components
    setLayers(components);
  }, [cache]);

  return (
    <div style={{ left: '-100000px', position: 'absolute' }}>{layers}</div>
  );
};

export default SimpleTileSource;
