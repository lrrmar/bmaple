import React, { useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { updateProfileId, selectSelectedId } from './geojsonFieldSlice';

import { request, Request, selectCache, Cache } from '../../mapping/cacheSlice';

import HashTablesServer from './geojsonFieldHashTables';
import SourceLayer from './GeojsonFieldSourceLayer';

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}
const GeojsonFieldSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const requestId = useSelector(selectSelectedId);

  useEffect(() => {
    if (requestId && !cache[requestId]) {
      dispatch(request({ id: requestId, source: 'geojsonField' }));
    } else {
      dispatch(updateProfileId(requestId));
    }
  }, [requestId]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return <SourceLayer sourceIdentifier={sourceIdentifier} id={id} key={id} />;
  });

  const HashTable = HashTablesServer();
  return <div className="GeojsonFieldSource">{sourcesToLoad}</div>;
};

export default GeojsonFieldSource;
