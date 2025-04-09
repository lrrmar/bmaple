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

export interface HashTable {
  id: string;
  field: string;
  level: string;
  start_time: string;
  valid_time: string;
  region: string;
}
const TeamxHashTablesServer = () => {
  const dispatch = useDispatch();
  const variablesRef = useRef([]);
  const [hashTables, setHashTables] = useState([]);
  const [exportHashTables, setExportHashTables] = useState([]);
  const [initRender, setInitRender] = useState(true);
  const apiUrl: string = useSelector(selectApiUrl);
  const [hashes, setHashes] = useState<HashTable[] | null>([]);

  useEffect(() => {
    // Retrieve hash tables from session storage OR initialise them
    // if not present
    setHashes(getHashTables());
  }, []);

  const getHashTables = (): HashTable[] | null => {
    let hashes = sessionStorage.getItem('teamxHashes');
    if (hashes === null) {
      sessionStorage.setItem('teamxHashes', JSON.stringify([]));
      hashes = sessionStorage.getItem('teamxHashes');
    }
    if (hashes === null) return null;
    return JSON.parse(hashes);
  };

  const appendHash = (val: HashTable) => {
    const hashes = getHashTables();
    if (hashes === null) return;
    hashes.push(val);
    sessionStorage.setItem('teamxHashes', JSON.stringify(hashes));
    const updatedHashesString = sessionStorage.getItem('teamxHashes');
    if (updatedHashesString === null) return;
    const updatedHashes = JSON.parse(updatedHashesString);
    setHashes(updatedHashes);
  };

  const appendHashes = (vals: HashTable[]) => {
    const hashes = getHashTables();
    if (!hashes) return;
    const concatHashes = hashes.concat(vals);
    const uniqueHashes = hashes.filter(
      (item: HashTable, index: number, self: HashTable[]) =>
        index === self.findIndex((t) => t.id === item.id),
    );
    sessionStorage.setItem('teamxHashes', JSON.stringify(concatHashes));
    const updatedHashesString = sessionStorage.getItem('teamxHashes');
    if (updatedHashesString === null) return;
    const updatedHashes = JSON.parse(updatedHashesString);
    setHashes(updatedHashes);
  };

  useEffect(() => {
    dispatch(updateHashesFlag());
    console.log(hashes);
  }, [hashes]);

  const fetchHashes = async () => {
    const response = await fetch(`${apiUrl}/hashes`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await response.json();
    appendHashes(json);
  };

  useEffect(() => {
    fetchHashes();
  }, []);

  return <div></div>;
};

export const useHashTables = () => {
  const hashes = sessionStorage.getItem('teamxHashes');
  return hashes == null ? [] : JSON.parse(hashes);
};

export default TeamxHashTablesServer;
