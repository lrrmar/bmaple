import React, { useEffect } from 'react';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '../../hooks';

import {
  getLayer,
  selectCache
} from '../../mapping/cacheSlice';

import {
  selectBase,
  selectSelectedCrrId,
  selectSelectedRdtId,
  /*selectFastaHashTables,*/
  updateProfileCrrId,
  updateProfileRdtId,
} from './fastaSlice';


/*
 *  todo...
 *
 *  - create cache types in cache slice and import
 *  - hashtables type


import fastaHashTableTo from '../utils/fastaHashTableToUrl';

import FastaHashTablesServer from './FastaHashTables';
import FastaSourceLayer from './FastaSourceLayer';

const FastaSource = () => {
  const dispatch = useDispatch();
  const base = useSelector(selectBaseUrl);
  const cache = useSelector(selectCache);
  const crrRequestId = useSelector(selectSelectedCrrId);
  const rdtRequestId = useSelector(selectSelectedRdtId);

  const fastaHashTables = useSelector(selectFastaHashTables);

  useEffect(() => {
    const allCacheRequests = fastaHashTables.map((url) => {
      console.log(fastaHashTableTo(url));
      const request = {
        id: fastaHashTableTo(url),
        source: 'fasta',
      };
      return request;
    });
    console.log('***all cache reqs: ', allCacheRequests);
    const newCacheRequests = allCacheRequests.filter(
      (req) => !cache[req.id],
    );
    console.log(newCacheRequests);
    dispatch(getLayer(newCacheRequests));
  }, [fastaHashTables]);

  useEffect(() => {
    if (crrRequestId && !cache[crrRequestId]) {
      dispatch(getLayer({ id: crrRequestId, source: 'fasta' }));
    } else {
      dispatch(updateFastaCrrGraphicProfileId(crrRequestId));
    }
  }, [crrRequestId]);

  useEffect(() => {
    if (rdtRequestId && !cache[rdtRequestId]) {
      dispatch(getLayer({ id: rdtRequestId, source: 'fasta' }));
    } else {
      dispatch(updateFastaRdtGraphicProfileId(rdtRequestId));
    }
  }, [rdtRequestId]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return <FastaSourceLayer key={id} id={id} />;
  });

  const fastaHashTable = FastaHashTablesServer();
  return <div className="FastaSource">{sourcesToLoad}</div>;
};

export default FastaSource;
