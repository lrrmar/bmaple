import React, { useEffect } from 'react';
import mapReducer, { mapSlice } from '../../mapping/mapSlice';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { request, Request, selectCache, Cache } from '../../mapping/cacheSlice';
import {
  selectSelectedOnsetVariable,
  selectSelectedDayOfYear,
  selectSelectedEntry,
  updateSelectedDayOfYear,
  updateSelectedEntry,
  updateProfileLayerId,
} from './cumulusSlice';

//import FastaHashTablesServer from './FastaHashTables';
//import hashTableToUrl from './fastaHashTableToUrl';
import CumulusSourceLayer from './CumulusSourceLayer';
//import type { HashTable } from './FastaHashTables';

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const CumulusSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const onsetVariable = useSelector(selectSelectedOnsetVariable);
  const dayOfYear: string | null = useSelector(selectSelectedDayOfYear);
  const entry: string | null = useSelector(selectSelectedEntry);
  //const liRequestId: string | null = useSelector(selectSelectedLightningId);
  //const hashTables: HashTable[] = useSelector(selectHashTables);

  // Put initial entry into cache
  useEffect(() => {
    const requestId = onsetVariable + '?' + dayOfYear + '?' + entry;
    const newRequest = {
      id: requestId,
      source: 'cumulus',
    };

    dispatch(request(newRequest));
  }, []);

  /*
  useEffect(() => {
    // converting "hashTables" into cache requests
    const allCacheRequests: Request[] = hashTables.map(
      (hashTable: HashTable) => {
        //console.log(hashTableToUrl(hashTable));
        const request = {
          id: hashTableToUrl(hashTable),
          source: 'fasta',
        };
        return request;
      },
    );

    console.log('***all cache reqs: ', allCacheRequests);
    const newCacheRequests = allCacheRequests.filter(
      (req: Request) => !cache[req.id],
    );
    //console.log(newCacheRequests);
    dispatch(request(newCacheRequests));
  }, [hashTables]);
  */

  useEffect(() => {
    const requestId = onsetVariable + '?' + dayOfYear + '?' + entry;
    if (requestId && !cache[requestId]) {
      console.log('CACHE MISS');
      dispatch(request({ id: requestId, source: 'cumulus' }));
    } else {
      console.log('CACHE HIT');
      dispatch(updateProfileLayerId(requestId));
    }
  }, [onsetVariable, dayOfYear, entry]);

  /*
  useEffect(() => {
    if (rdtRequestId && !cache[rdtRequestId]) {
      dispatch(request({ id: rdtRequestId, source: 'fasta' }));
    } else {
      dispatch(updateProfileRdtId(rdtRequestId));
    }
  }, [rdtRequestId]);

  useEffect(() => {
    if (liRequestId && !cache[liRequestId]) {
      dispatch(request({ id: liRequestId, source: 'fasta' }));
    } else {
      dispatch(updateProfileLightningId(liRequestId));
    }
  }, [liRequestId]);
  */

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return (
      <CumulusSourceLayer
        sourceIdentifier={sourceIdentifier}
        key={id}
        id={id}
      />
    );
  });

  //const fastaHashTable = FastaHashTablesServer();

  // return <div className="FastaSource">{sourcesToLoad}</div>;

  return <div className="CumulusSource">{sourcesToLoad}</div>;
};

export default CumulusSource;
