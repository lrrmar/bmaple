import React, { useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import {
  selectHashTables,
  updateProfileId,
  selectSelectedId,
  selectVarname,
  selectStartTime,
  selectDomain,
} from './geojsonFieldSlice';

import { request, Request, Cache } from '../../mapping/cacheSlice';

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
  const variableHashes: HashTable[] = useSelector(selectHashTables);

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
    const layerHashes = variableHashes.find((dict) =>
      Object.entries(metaData).every(([key, value]) => dict[key] === value),
    );
    console.log(layerHashes);
  }, [varname, startTime, domain]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return <SourceLayer sourceIdentifier={sourceIdentifier} id={id} key={id} />;
  });

  const HashTable = HashTablesServer();
  return <div className="GeojsonFieldSource">{sourcesToLoad}</div>;
};

export default GeojsonFieldSource;
