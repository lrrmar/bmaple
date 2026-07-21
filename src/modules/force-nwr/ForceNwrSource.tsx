import React, { useEffect, useState, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  updateDisplayTimes,
  updateDisplayTime,
  updateVerticalLevels,
  updateVerticalLevel,
  selectIsoDisplayTime,
  selectDisplayTimesIntersection,
  selectVerticalLevel,
  selectVerticalLevelsIntersection,
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
  updateBackendDiscreteMetaData,
  updateReadableNames,
} from './forceNwrSlice';

import {
  ContinuousMetaData,
  DiscreteMetaData,
  DiscreteHeader,
  Hash,
} from './types';

import { selectCache, request } from '../../mapping/cacheSlice';

import ForceNwrImage from './ForceNwrImage';

/*interface Hash {
  [key: string]: string | null;
  id: string;
  domain: string;
  field: string;
  valid_time: string;
  start_time: string;
  plot: string;
  location: string | null;
  level: string;
}*/
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
  const previousSelections = useRef<{
    [key: string]: Partial<DiscreteMetaData> | null;
  }>({});
  const displayTime = useSelector(selectIsoDisplayTime);
  const displayTimesIntersection = useSelector(selectDisplayTimesIntersection);
  const verticalLevel = useSelector(selectVerticalLevel);
  const verticalLevelsIntersection = useSelector(
    selectVerticalLevelsIntersection,
  );
  const [continuousMetaData, setContinuousMetaData] = useState<{
    [key: string]: ContinuousMetaData | null;
  }>({});
  const [currentHashes, setCurrentHashes] = useState<{ [key: string]: Hash[] }>(
    {},
  );
  const [layers, setLayers] = useState<React.ReactNode[]>([]);
  const [loadedResources, setLoadedResources] = useState<string[]>([]);
  const [preloadIds, setPreloadIds] = useState<{ [key: string]: string[] }>({});

  const fetchDiscreteMetaData = async () => {
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

  const fetchPreloadIds = async (preloadId: string, resourceId: string) => {
    const response = await fetch(
      `${apiUrl}/preloadIds/?id=${resourceId}&buffer=3`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const json = await response.json();
    const preload = { ...preloadIds };
    preload[preloadId] = json;
    setPreloadIds(preload);
  };

  const fetchContinuousHashes = async (
    hostId: string,
    selection: Partial<DiscreteMetaData>,
  ) => {
    const response = await fetch(`${apiUrl}/continuousQueryHashes/`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(selection),
    });
    const json = await response.json();
    const updatedHashes = { ...currentHashes };
    updatedHashes[hostId] = json;
    setCurrentHashes(updatedHashes);
    previousSelections.current[hostId] = selection;
  };

  useEffect(() => {
    // on initial render, fetch meta data
    if (backendDiscreteMetaData) return;
    fetchDiscreteMetaData();
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
    Object.keys(discreteMetaDataSelections).forEach((id) => {
      const discreteMetaDataSelection = discreteMetaDataSelections[id];
      if (discreteMetaDataSelection) {
        const selection: Partial<DiscreteMetaData> = {};
        for (const key of Object.keys(
          discreteMetaDataSelection,
        ) as DiscreteHeader[]) {
          const val = discreteMetaDataSelection[key];
          if (val) selection[key] = val;
        }
        const prevSelection = previousSelections.current[id];
        if (
          !prevSelection || // previous selection for this id has not been made
          (prevSelection &&
            (Object.keys(selection) as (keyof DiscreteMetaData)[]).some(
              // prev seletion has been made
              (key) => selection[key] !== prevSelection[key], // prev and current selection mismatch
            )) ||
          Object.keys(selection).length !== Object.keys(prevSelection).length
        ) {
          fetchContinuousHashes(id.toString(), selection);
        }
      }
    });
  }, [discreteMetaDataSelections]);

  useEffect(() => {
    // Populate sliders with continuous variable values
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
              /*.map(
                (timeString) =>
                  new Date(timeString).getTime() -
                  new Date().getTimezoneOffset() * 60 * 1000,
              )*/
              .sort();
            if (times && levels) {
              dispatch(
                updateDisplayTimes({
                  source: sourceIdentifier + key,
                  times: times,
                }),
              );

              dispatch(
                updateVerticalLevels({
                  source: sourceIdentifier + key,
                  levels: levels,
                }),
              );
            }
          }
        }
      });
    }
  }, [currentHashes]);

  useEffect(() => {
    if (
      !displayTime ||
      (displayTime &&
        displayTimesIntersection &&
        !displayTimesIntersection.includes(new Date(displayTime).getTime()))
    ) {
      dispatch(updateDisplayTime(displayTimesIntersection[0]));
    }
  }, [displayTimesIntersection]);

  useEffect(() => {
    if (
      !verticalLevel ||
      (verticalLevel &&
        verticalLevelsIntersection &&
        !verticalLevelsIntersection.includes(verticalLevel))
    ) {
      dispatch(updateVerticalLevel(verticalLevelsIntersection[0]));
    }
  }, [verticalLevelsIntersection]);

  useEffect(() => {
    // On ANY metadata change, check cache and if not present
    // request image url

    Object.keys(discreteMetaDataSelections).forEach((hostId) => {
      const discreteMetaDataSelection = discreteMetaDataSelections[hostId];
      if (discreteMetaDataSelection) {
        const selection: Partial<DiscreteMetaData> = {};
        for (const key of Object.keys(
          discreteMetaDataSelection,
        ) as DiscreteHeader[]) {
          const val = discreteMetaDataSelection[key];
          if (val) selection[key] = val;
        }

        const locks = continuousMetaDataLocks[hostId];
        let valid_time: string | null = displayTime;
        let level: string | null = verticalLevel;
        if (locks) {
          valid_time = locks.valid_time ? locks.valid_time : valid_time;
          level = locks.level ? locks.level : level;
        }
        let profileIds: string | null = null;
        if (selection) {
          const query = { ...selection };
          if (valid_time) query['valid_time'] = valid_time;
          if (level) query['level'] = level;
          if (Object.values(query).every((val) => !!val)) {
            const theseHashes = currentHashes[hostId];
            if (theseHashes) {
              // Get single profile id
              const profileHash = theseHashes.find((dict: Hash) =>
                Object.entries(query).every(([key, value]) => {
                  const match = dict[key];
                  if (match) return match == value;
                }),
              );
              if (profileHash) {
                // If a profileHash does exists for our selection we need to update
                // the profileId if it is not equal to that currently set;
                // however if it is the same (which happens quite frequently due to
                // the many bits of state this useEffect subscribes to) then just do
                // nothing and keep it the same as it was previously.
                profileIds = profileHash.id;
              }
            }
          }
        }
        // If profileHash does not exist then we express that there is no
        // valid profileId available for this host

        dispatch(updateProfileIds({ host: hostId, resource: profileIds }));
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

  /*useEffect(() => {
    // Preload all along vertical axis

    const updatedLevelHashes: { [key: string]: string[] } = {};
    Object.keys(discreteMetaDataSelections).forEach((id) => {
      const selection = discreteMetaDataSelections[id];
      if (selection) {
        const locks = continuousMetaDataLocks[id];
        let time = displayTime;
        if (locks) {
          time = locks.valid_time ? locks.valid_time : time;
        }
        const timesQuery = {
          ...selection,
          valid_time: time,
        };
        // Get all hashes that match the query for any time
        const theseHashes = currentHashes[id];
        if (theseHashes) {
          const thesePreloadHashes = currentHashes[id].filter((dict: Hash) =>
            Object.entries(timesQuery).every(([key, value]) => {
              const match = dict[key];
              if (match) return match == value;
            }),
          );

          if (thesePreloadHashes) {
            const thesePreloadIds = thesePreloadHashes.map(
              (hash: Hash) => hash.id,
            );
            updatedLevelHashes[id] = thesePreloadIds;
          }
        }
      }
    });
    setPreloadIds(updatedLevelHashes);
  }, [verticalLevel, currentHashes]);*/

  /*useEffect(() => {
    // Preload all along time axis

    const updatedTimeHashes: { [key: string]: string[] } = {};
    let activeHosts = Object.values(profileIds).filter((e) => !!e).length;
    activeHosts = activeHosts == 0 ? 1 : activeHosts;
    const maxImagesPerScroll = 12;
    const limiter = Math.floor(maxImagesPerScroll / activeHosts);
    Object.keys(discreteMetaDataSelections).forEach((id) => {
      const selection = discreteMetaDataSelections[id];
      if (selection) {
        const locks = continuousMetaDataLocks[id];
        let level = verticalLevel;
        if (locks) {
          level = locks.level ? locks.level : level;
        }
        const timesQuery = {
          ...selection,
          level: level,
        };
        // Get all hashes that match the query for any time
        const theseHashes = currentHashes[id];
        if (theseHashes) {
          let thesePreloadHashes = currentHashes[id].filter((dict: Hash) =>
            Object.entries(timesQuery).every(([key, value]) => {
              const match = dict[key];
              if (match) return match == value;
            }),
          );
          /* The ideal behaviour here is to preload all images that are N away from
           * the current one in the array of displayTimes, i.e. if we are at image 10
           * w.r.t. displayTimes array, we want to load the the images 10-N to 10 + N
           */

  // Filter hashes that have a time outside of display times
  /*thesePreloadHashes = thesePreloadHashes.filter((hash: Hash) =>
            displayTimesIntersection.includes(
              new Date(hash.valid_time).getTime(),
            ),
          );

          // Filter hashes that have been loaded
          thesePreloadHashes = thesePreloadHashes.filter(
            (hash: Hash) => !loadedResources.includes(hash.id),
          );

          // Order base on distance from current display time
          thesePreloadHashes = thesePreloadHashes.sort((a: Hash, b: Hash) => {
            const diffA = Math.abs(
              new Date(a.valid_time).getTime() -
                new Date(displayTime).getTime(),
            );
            const diffB = Math.abs(
              new Date(b.valid_time).getTime() -
                new Date(displayTime).getTime(),
            );
            if (diffA < diffB) {
              return -1;
            } else if (diffA > diffB) {
              return 1;
            }
            return 0;
          });

          if (thesePreloadHashes) {
            const thesePreloadIds = thesePreloadHashes.map(
              (hash: Hash) => hash.id,
            );
            updatedTimeHashes[id] = thesePreloadIds.slice(0, limiter); // limited
          }
        }
      }
    });
    setPreloadIds(updatedTimeHashes);
  }, [displayTime, currentHashes]);*/

  useEffect(() => {
    const resourceIds: string[] = Object.values(profileIds).filter(
      (e): e is Exclude<typeof e, null> => e !== null,
    ); // not null
    let updatedLoadedResources = [
      ...new Set(loadedResources.concat(resourceIds)),
    ];

    const maxLength = Math.max(
      ...Object.values(preloadIds).map((arr) => arr.length),
    );
    const orderedIds: string[] = [];
    for (let i = 0; i < maxLength; i++) {
      Object.values(preloadIds).forEach((idArr) => {
        if (idArr[i]) orderedIds.push(idArr[i]);
      });
    }

    updatedLoadedResources = [
      ...new Set(updatedLoadedResources.concat(orderedIds)),
    ];

    setLoadedResources(updatedLoadedResources);
  }, [profileIds, preloadIds]);

  useEffect(() => {
    if (profileIds) {
      Object.entries(profileIds).forEach((profile) => {
        const key = profile[0];
        const val = profile[1];
        if (key && val) fetchPreloadIds(key, val);
      });
    }
  }, [profileIds]);

  useEffect(() => {
    const components = loadedResources.map((id) => (
      <ForceNwrImage key={id} id={id} sourceIdentifier={sourceIdentifier} />
    ));
    setLayers(components);
  }, [loadedResources]);

  /*useEffect(() => {
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
  }, [profileIds]);*/

  return (
    <div style={{ left: '-100000px', position: 'absolute' }}>{layers}</div>
  );
};

export default ForceNwrSource;
