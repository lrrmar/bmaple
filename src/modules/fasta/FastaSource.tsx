import React, { useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { request, Request, selectCache, Cache } from '../../mapping/cacheSlice';
import {
  selectSelectedCrrId,
  selectSelectedRdtId,
  selectHashTables,
  updateProfileCrrId,
  updateProfileRdtId,
} from './fastaSlice';
import FastaHashTablesServer from './FastaHashTables';
import hashTableToUrl from './fastaHashTableToUrl';
import FastaSourceLayer from './FastaSourceLayer';
import type { HashTable } from './FastaHashTables';

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const FastaSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const crrRequestId : string = useSelector(selectSelectedCrrId);
  const rdtRequestId : string = useSelector(selectSelectedRdtId);
  const hashTables : HashTable[] = useSelector(selectHashTables);

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
    return <FastaSourceLayer sourceIdentifier={sourceIdentifier} key={id} id={id} />;
  });

  const fastaHashTable = FastaHashTablesServer();
  return <div className="FastaSource">{sourcesToLoad}</div>;
};

export default FastaSource;
