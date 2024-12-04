import React, { useEffect } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { request, Request, selectCache } from '../../mapping/cacheSlice';

import {
  selectBaseUrl,
  selectSelectedCrrId,
  selectSelectedRdtId,
  selectHashTables,
  updateProfileCrrId,
  updateProfileRdtId,
} from './fastaSlice';

/*
 *  todo...
 *
 *  - create cache types in cache slice and import
 *  - hashtables type
 */

import hashTableToUrl from './fastaHashTableToUrl';
import FastaSourceLayer from './FastaSourceLayer';


interface HashTable {
  name: string
  timeslot: string
  is_latest: boolean
  forecast_slot: string
  forecast_timestamp: null
}

const FastaSource = () => {
  const dispatch = useDispatch();
  const base = useSelector(selectBaseUrl);
  const cache = useSelector(selectCache);
  const crrRequestId = useSelector(selectSelectedCrrId);
  const rdtRequestId = useSelector(selectSelectedRdtId);

  const hashTables = useSelector(selectHashTables);

  useEffect(() => {
    const allCacheRequests: Request[] = hashTables.map((hashTable: HashTable) => {
      console.log(hashTableToUrl(hashTable));
      const request = {
        id: hashTableToUrl(hashTable),
        source: 'fasta',
      };
      return request;
    });
    console.log('***all cache reqs: ', allCacheRequests);
    const newCacheRequests = allCacheRequests.filter((req: Request) => !cache[req.id]);
    console.log(newCacheRequests);
    dispatch(request(newCacheRequests));
  }, [hashTables]);

  useEffect(() => {
    if (crrRequestId && !cache[crrRequestId]) {
      dispatch(request({ id: crrRequestId, source: 'fasta' }));
    } else {
      dispatch(updateProfileCrrId(crrRequestId));
    }
  }, [crrRequestId]);

  useEffect(() => {
    if (rdtRequestId && !cache[rdtRequestId]) {
      dispatch(request({ id: rdtRequestId, source: 'fasta' }));
    } else {
      dispatch(updateProfileRdtId(rdtRequestId));
    }
  }, [rdtRequestId]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return <FastaSourceLayer key={id} id={id} />;
  });

  return <div className="FastaSource">{sourcesToLoad}</div>;
};

export default FastaSource;
