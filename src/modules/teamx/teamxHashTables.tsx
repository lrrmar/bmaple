import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { updateHashesFlag, selectApiUrl } from './teamxSlice';

/*export interface Hash {
  id: string;
  field: string;
  level: string;
  start_time: string;
  valid_time: string;
  region: string;
  run: string;
}*/

export interface HashTable {
  hashes: Record<string, string>[];
  lookup: Record<string, string>;
}

/*export const isHash = (element: any): element is Hash => {
  const keys: string[] = Object.keys(element);
  return (
    keys.includes('id') &&
    keys.includes('level') &&
    keys.includes('start_time') &&
    keys.includes('valid_time') &&
    keys.includes('field') &&
    keys.includes('region') &&
    keys.includes('run')
  );
};*/

export const isHash = (element: any): element is Record<string, string> => {
  const keys = Object.keys(element);
  const vals = Object.values(element);
  const keysAllStrings = keys.reduce(
    (acc, curr) => acc && typeof curr === 'string',
    true,
  );
  const valsAllNumbers = keys.reduce(
    (acc, curr) => acc && typeof curr === 'string',
    true,
  );
  return keysAllStrings && valsAllNumbers;
};

export const isLookup = (element: any): element is Record<string, number> => {
  const keys = Object.keys(element);
  const vals = Object.values(element);
  const keysAllStrings = keys.reduce(
    (acc, curr) => acc && typeof curr === 'string',
    true,
  );
  const valsAllNumbers = keys.reduce(
    (acc, curr) => acc && typeof curr === 'string',
    true,
  );
  return keysAllStrings && valsAllNumbers;
};

export const isHashTable = (element: any): element is HashTable => {
  const hashes = element['hashes'];
  const lookup = element['lookup'];
  if (hashes && lookup) {
    return hashes.reduce((acc: any, curr: any) => {
      console.log(isHash(curr));
      console.log(curr);
      return acc && isHash(curr);
    }, isLookup(lookup));
  }
  return false;
};

const TeamxHashTablesServer = () => {
  const dispatch = useDispatch();
  const variablesRef = useRef([]);
  const [hashTables, setHashTables] = useState<HashTable | null>(null);
  const [exportHashTables, setExportHashTables] = useState([]);
  const [initRender, setInitRender] = useState(true);
  const apiUrl: string = useSelector(selectApiUrl);
  const [hashes, setHashes] = useState<Record<string, string>[] | null>([]);

  useEffect(() => {
    // Retrieve hash tables from session storage OR initialise them
    // if not present
    const hashTables = getHashTables();
    if (isHashTable(hashTables)) setHashes(hashTables['hashes']);
  }, []);

  const getHashTables = (): HashTable | null => {
    let hashes = sessionStorage.getItem('teamxHashes');
    if (hashes === null) {
      sessionStorage.setItem('teamxHashes', JSON.stringify([]));
      hashes = sessionStorage.getItem('teamxHashes');
    }
    if (hashes === null) return null;
    return JSON.parse(hashes);
  };

  const appendHash = (val: Record<string, string>) => {
    const hashTables = getHashTables();
    let hashes: Record<string, string>[] | null = null;
    if (hashTables) hashes = hashTables['hashes'];
    if (hashes === null) return;
    hashes.push(val);
    sessionStorage.setItem('teamxHashes', JSON.stringify(hashes));
    const updatedHashesString = sessionStorage.getItem('teamxHashes');
    if (updatedHashesString === null) return;
    const updatedHashes = JSON.parse(updatedHashesString);
    setHashes(updatedHashes);
  };

  const appendHashes = (vals: Record<string, string>[]) => {
    const hashTables = getHashTables();
    let hashes: Record<string, string>[] | null = null;
    if (hashTables) hashes = hashTables['hashes'];
    if (!hashes) return;
    const concatHashes = hashes.concat(vals);
    const uniqueHashes = hashes.filter(
      (
        item: Record<string, string>,
        index: number,
        self: Record<string, string>[],
      ) => index === self.findIndex((t) => t.id === item.id),
    );
    sessionStorage.setItem('teamxHashes', JSON.stringify(concatHashes));
    const updatedHashesString = sessionStorage.getItem('teamxHashes');
    if (updatedHashesString === null) return;
    const updatedHashes = JSON.parse(updatedHashesString);
    setHashes(updatedHashes);
  };

  const updateHashTable = (newHashTable: HashTable) => {
    const hashTables = getHashTables();
    if (hashTables === null) return;
    sessionStorage.setItem('teamxHashes', JSON.stringify(newHashTable));
    dispatch(updateHashesFlag());
  };

  useEffect(() => {
    dispatch(updateHashesFlag());
    console.log(hashes);
  }, [hashes]);

  const fetchHashes = async () => {
    const response = await fetch(`${apiUrl}/hashes?normalised=true`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await response.json();
    updateHashTable(json);
  };

  useEffect(() => {
    fetchHashes();
  }, []);

  return <div></div>;
};

export const useHashTables = (): HashTable | null => {
  const h = sessionStorage.getItem('teamxHashes');
  if (h) {
    const hashTables = JSON.parse(h);
    console.log(isHashTable(hashTables));
    return isHashTable(hashTables) ? hashTables : null;
  } else {
    return null;
  }
};

export default TeamxHashTablesServer;
