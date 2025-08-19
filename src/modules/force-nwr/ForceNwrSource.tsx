import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  updateDisplayTimes,
  updateVerticalLevels,
  selectDisplayTime,
  selectVerticalLevel,
} from '../../mapping/mapSlice';
//import { updateVerticalLevels  } from '../../mapping/mapSlice';

import {
  selectApiUrl,
  selectDiscreteMetaData,
  updateProfileId,
  selectProfileId,
  selectSelectedResources,
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
  const profileId = useSelector(selectProfileId);
  const selectedResources = useSelector(selectSelectedResources);
  const discreteMetaData = useSelector(selectDiscreteMetaData);
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const [continuousMetaData, setContinuousMetaData] =
    useState<ContinuousMetaData | null>(null);
  const [currentHashes, setCurrentHashes] = useState<Hash[]>([]);
  const [layers, setLayers] = useState<React.ReactNode[]>([]);
  const [loadedResources, setLoadedResources] = useState<string[]>([]);

  useEffect(() => {
    const fetchMetaData = async () => {
      const response = await fetch(`${apiUrl}/continuousQueryHashes/`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          field: discreteMetaData.field,
          domain: discreteMetaData.domain,
          start_time: discreteMetaData.start_time,
        }),
      });
      const json = await response.json();
      setCurrentHashes(json);
    };
    if (Object.values(discreteMetaData).every((val) => !!val)) fetchMetaData();
  }, [discreteMetaData]);

  /*useEffect(() => {
    // On discrete meta data change, request continuous meta data
    if (continuousMetaData) {
      const timeStrings = continuousMetaData.valid_time;
      const levels = continuousMetaData.level;
      if (timeStrings && levels) {
        const times = timeStrings
          .map((timeString) => new Date(timeString).getTime())
          .sort();
        if (times && levels) {
          dispatch(
            updateDisplayTimes({ source: sourceIdentifier, times: times }),
          );
          dispatch(updateVerticalLevels(levels));
        }
      }
    }
  }, [continuousMetaData]);*/

  useEffect(() => {
    // On hash change, get times and levels from hashes
    if (currentHashes.length > 0) {
      const timeStrings = [
        ...new Set(currentHashes.map((hash) => hash.valid_time)),
      ];
      const levels = [...new Set(currentHashes.map((hash) => hash.level))];
      if (timeStrings && levels) {
        {
          /*const allLevels = [
          'single',
          'p',
        ];
        const orderedLevels = allLevels.filter((level) =>
          levels.includes(level),
        );*/
        }
        const orderedLevels = levels;
        const times = timeStrings
          .map((timeString) => new Date(timeString).getTime())
          .sort();
        if (times && orderedLevels) {
          dispatch(
            updateDisplayTimes({ source: sourceIdentifier, times: times }),
          );
          dispatch(updateVerticalLevels(orderedLevels));
        }
      }
    }
  }, [currentHashes]);

  useEffect(() => {
    // On ANY metadata change, check cache and if not present
    // request image url

    ///// HASH TABLES TOO BIG TO TRAVERSE?
    /*if (hashTables) {
      if (Object.values(query).every((val) => !!val)) {
        const hashes = hashTables['hashes'];
        const normalised_query: { [key: string]: string } = {};
        Object.keys(query).forEach((key) => {
          const lookups = hashTables['lookup'];
          let normalised_key: string | null = null;
          let normalised_val: string | null = null;
          normalised_key = lookups[key];
          const val = query[key];
          if (val) normalised_val = lookups[val];
          if (
            normalised_key !== null &&
            normalised_val !== null &&
            normalised_key !== undefined &&
            normalised_val !== undefined
          )
            normalised_query[normalised_key] = normalised_val;
        });
        const layerHash = hashes.find((dict: Record<string, string>) =>
          Object.entries(normalised_query).every(([key, value]) => {
            const match = dict[key];
            if (match) return match == value;
          }),
        );
        if (layerHash) dispatch(updateProfileId(layerHash.id));
      }
    }*/

    /*const queryForSource = async (query: Query) => {
      const apiUrl = 'http://localhost:8383';
      const response = await fetch(`${apiUrl}/queryForSource/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });
      const json = await response.json();
      if (json) {
        dispatch(updateProfileId(json));
        const cacheElement = cache[json];
        if (!cacheElement)
          dispatch(
            request({
              ...query,
              id: json,
              source: sourceIdentifier,
            }),
          );
      }
    };*/

    const query: Query = {
      ...discreteMetaData,
      valid_time: displayTime.replace('.00', ''),
      level: verticalLevel,
    };
    if (Object.values(query).every((val) => !!val)) {
      const thisHash = currentHashes.find((dict: Hash) =>
        Object.entries(query).every(([key, value]) => {
          const match = dict[key];
          if (match) return match == value;
        }),
      );
      if (thisHash) {
        dispatch(updateProfileId(thisHash.id));
      } else {
        dispatch(updateProfileId(null));
      }
    }
  }, [discreteMetaData, displayTime, verticalLevel, currentHashes, cache]);

  useEffect(() => {
    const resourceIds = Object.values(selectedResources).filter(
      (id) => id !== null,
    ); // not null
    const updatedLoadedResources = [
      ...new Set(loadedResources.concat(resourceIds)),
    ];
    setLoadedResources(updatedLoadedResources);
  }, [selectedResources]);

  useEffect(() => {
    const components = loadedResources.map((id) => (
      <ForceNwrImage key={id} id={id} sourceIdentifier={sourceIdentifier} />
    ));
    setLayers(components);
  }, [loadedResources]);

  useEffect(() => {
    if (profileId) {
      const cacheElement = cache[profileId];
      if (!cacheElement)
        dispatch(
          request({
            id: profileId,
            source: sourceIdentifier,
          }),
        );
    }
  }, [profileId]);

  return <div style={{ left: '-100000px' }}>{layers}</div>;
};

export default ForceNwrSource;
