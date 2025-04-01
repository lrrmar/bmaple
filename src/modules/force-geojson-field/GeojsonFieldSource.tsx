import React, { useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import {
  selectHashTables,
  updateProfileId,
  selectProfileId,
  selectSelectedId,
  selectVarname,
  selectStartTime,
  selectDomain,
  updateVerticalLevels,
  updateVerticalLevelUnits,
  updateUnits,
} from './geojsonFieldSlice';

import { request, Request, Cache } from '../../mapping/cacheSlice';
import { updateDisplayTimes } from '../../mapping/mapSlice';

import HashTablesServer from './geojsonFieldHashTables';
import SourceLayer from './GeojsonFieldSourceLayer';
import { HashTable } from './geojsonFieldHashTables';

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}
const GeojsonFieldSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const requestId = useSelector(selectSelectedId);
  const profileId = useSelector(selectProfileId);
  const allHashes: HashTable[] = useSelector(selectHashTables);

  const varname = useSelector(selectVarname);
  const startTime = useSelector(selectStartTime);
  const domain = useSelector(selectDomain);

  useEffect(() => {
    if (requestId && !cache[requestId]) {
      dispatch(request({ id: requestId, source: sourceIdentifier }));
    } else {
      dispatch(updateProfileId(requestId));
    }
  }, [requestId]);

  // Pull scrollable meta data following a meta data selection change
  useEffect(() => {
    const metaData = {
      varname: varname,
      sim_start_time: startTime,
      grid_id: domain,
    };
    const selectedHashes: HashTable[] = allHashes.filter((dict) =>
      Object.entries(metaData).every(([key, value]) => dict[key] === value),
    );
    if (selectedHashes && selectedHashes.length > 0) {
      // for each layer hash that matches the metadata, convert string time
      // to int and then make this collection unique i.e. convert to set
      // and back to array
      //
      const times = [
        ...new Set(
          selectedHashes.map(
            (hash) => new Date(hash['valid_time']).getTime(), // unix timestamp
          ),
        ),
      ].sort();
      dispatch(updateDisplayTimes({ source: sourceIdentifier, times: times }));

      const levelStrings = [
        ...new Set(selectedHashes.map((hash) => hash['level_type'])),
      ];

      const levels = levelStrings.map((level: string) => {
        let numeric = level.replace(/[a-zA-Z]/g, '');
        numeric = numeric === '' ? '0' : numeric;
        return Number(numeric);
      });
      {
        /*const units: string = levelStrings.reduce(
        (unit: string, current: string) => {
          console.log(unit);
          const alpha: string = current.replace(/[^a-zA-Z]/g, '');
          console.log(alpha);
          //if (!unit.includes(alpha)) unit + `, ${alpha}`;
          unit = alpha;
        },
        '',
      );*/
      }
      const units = levelStrings[0].replace(/[^a-zA-Z]/g, '');

      dispatch(updateVerticalLevels(levels));
      dispatch(updateVerticalLevelUnits(units));
    }
  }, [varname, startTime, domain, profileId]);

  // valid_time
  useEffect(() => {
    const metaData = {
      varname: varname,
      sim_start_time: startTime,
      grid_id: domain,
    };
    const selectedHashes: HashTable[] = allHashes.filter((dict) =>
      Object.entries(metaData).every(([key, value]) => dict[key] === value),
    );
    if (selectedHashes && selectedHashes.length > 0) {
      // for each layer hash that matches the metadata, convert string time
      // to int and then make this collection unique i.e. convert to set
      // and back to array
      //
      const times = [
        ...new Set(
          selectedHashes.map(
            (hash) => new Date(hash['valid_time']).getTime(), // unix timestamp
          ),
        ),
      ].sort();
      dispatch(updateDisplayTimes({ source: sourceIdentifier, times: times }));
    }
  }, [varname, startTime, domain, profileId]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return <SourceLayer sourceIdentifier={sourceIdentifier} id={id} key={id} />;
  });

  const HashTable = HashTablesServer();
  return <div className="GeojsonFieldSource">{sourcesToLoad}</div>;
};

export default GeojsonFieldSource;
