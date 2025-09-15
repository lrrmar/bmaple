import React, { useEffect, useState, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  updateDisplayTimes,
  updateVerticalLevels,
  selectIsoDisplayTime,
  selectVerticalLevel,
} from '../../mapping/mapSlice';
//import { updateVerticalLevels  } from '../../mapping/mapSlice';

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
} from './forceNwrSlice';
import { selectCache, request } from '../../mapping/cacheSlice';

import ForceNwrImage from './ForceNwrImage';

interface ContinuousMetaData {
  valid_time: string[];
  start_time: string[];
  level: string[];
}

interface Hash {
  [key: string]: string;
  id: string;
  domain: string;
  field: string;
  valid_time: string;
  start_time: string;
  level: string;
}
interface Query {
  domain: string | null;
  field: string | null;
  valid_time: string | null;
  start_time: string | null;
  level: string | null;
}
const ForceNwrSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
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
  const verticalLevel = useSelector(selectVerticalLevel);
  const [continuousMetaData, setContinuousMetaData] = useState<{
    [key: string]: ContinuousMetaData | null;
  }>({});
  const [currentHashes, setCurrentHashes] = useState<{ [key: string]: Hash[] }>(
    {},
  );
  const [layers, setLayers] = useState<React.ReactNode[]>([]);
  const [loadedResources, setLoadedResources] = useState<string[]>([]);

  useEffect(() => {
    const fetchMetaData = async () => {
      const response = await fetch(`${apiUrl}/getDiscreteMetaData/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const json = await response.json();
      //setMetaData(json);
      dispatch(updateBackendDiscreteMetaData(json));
    };
    // on initial render, fetch meta data
    if (backendDiscreteMetaData) return;
    fetchMetaData();
  }, []);

  useEffect(() => {
    const fetchReadableNames = async () => {
      const response = await fetch(`${apiUrl}/getReadableNames/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const json = await response.json();
      dispatch(updateReadableNames(json));
    };
    // on initial render, fetch meta data
    if (readableNames) return;
    fetchReadableNames();
  }, []);

  useEffect(() => {
    const fetchMetaData = async (
      hostId: string,
      selection: DiscreteMetaData,
    ) => {
      const response = await fetch(`${apiUrl}/continuousQueryHashes/`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          field: selection.field,
          domain: selection.domain,
          start_time: selection.start_time,
        }),
      });
      const json = await response.json();
      const updatedHashes = { ...currentHashes };
      updatedHashes[hostId] = json;
      setCurrentHashes(updatedHashes);
      previousSelections.current[hostId] = selection;
    };
    Object.keys(discreteMetaDataSelections).forEach((id) => {
      const selection = discreteMetaDataSelections[id];
      const prevSelection = previousSelections.current[id];
      if (
        selection && // selection is not null
        Object.values(selection).every((val) => !!val) && // each option is not null
        (!prevSelection || // previous selection for this id has not been made
          (prevSelection &&
            Object.keys(selection).some(
              // prev seletion has been made
              (key: string) => selection[key] !== prevSelection[key], // prev and current selection mismatch
            )))
      ) {
        fetchMetaData(id.toString(), selection);
      }
    });
  }, [discreteMetaDataSelections]);

  useEffect(() => {
    // On discrete meta data change, request continuous meta data
    if (currentHashes) {
      Object.keys(currentHashes).forEach((key) => {
        const hashes = currentHashes[key];
        if (hashes) {
          const timeStrings = [
            ...new Set(hashes.map((hash) => hash.valid_time)),
          ];
          const levels = [...new Set(hashes.map((hash) => hash.level))];
          if (timeStrings && levels) {
            const times = timeStrings
              .map((timeString) => new Date(timeString).getTime())
              .sort();
            if (times && levels) {
              dispatch(
                updateDisplayTimes({
                  source: sourceIdentifier + key,
                  times: times,
                }),
              );
              dispatch(updateVerticalLevels(levels));
            }
          }
        }
      });
    }
  }, [currentHashes]);

  useEffect(() => {
    // On ANY metadata change, check cache and if not present
    // request image url

    Object.keys(discreteMetaDataSelections).forEach((id) => {
      const selection = discreteMetaDataSelections[id];
      const locks = continuousMetaDataLocks[id];
      let valid_time: string | null = displayTime;
      let level: string | null = verticalLevel;
      if (locks) {
        valid_time = locks.valid_time ? locks.valid_time : valid_time;
        level = locks.level ? locks.level : level;
      }
      if (selection) {
        const query: Query = {
          ...selection,
          valid_time: valid_time,
          level: level,
        };
        if (Object.values(query).every((val) => !!val)) {
          const theseHashes = currentHashes[id];
          if (theseHashes) {
            const thisHash = theseHashes.find((dict: Hash) =>
              Object.entries(query).every(([key, value]) => {
                const match = dict[key];
                if (match) return match == value;
              }),
            );
            if (thisHash) {
              dispatch(updateProfileIds({ host: id, resource: thisHash.id }));
            } else {
              dispatch(updateProfileIds({ host: id, resource: null }));
            }
          }
        }
      }
    });
  }, [
    discreteMetaDataSelections,
    continuousMetaDataLocks,
    displayTime,
    verticalLevel,
    currentHashes,
    cache,
  ]);

  useEffect(() => {
    const resourceIds: string[] = Object.values(profileIds).filter(
      (e): e is Exclude<typeof e, null> => e !== null,
    ); // not null
    const updatedLoadedResources = [
      ...new Set(loadedResources.concat(resourceIds)),
    ];
    setLoadedResources(updatedLoadedResources);
  }, [profileIds]);

  useEffect(() => {
    const components = loadedResources.map((id) => (
      <ForceNwrImage key={id} id={id} sourceIdentifier={sourceIdentifier} />
    ));
    setLayers(components);
  }, [loadedResources]);

  useEffect(() => {
    if (profileIds) {
      Object.keys(profileIds).forEach((id) => {
        const cacheElement = cache[id];
        if (!cacheElement)
          dispatch(
            request({
              id: id,
              source: sourceIdentifier,
            }),
          );
      });
    }
  }, [profileIds]);

  return (
    <div style={{ left: '-100000px', position: 'absolute' }}>{layers}</div>
  );
};

export default ForceNwrSource;
