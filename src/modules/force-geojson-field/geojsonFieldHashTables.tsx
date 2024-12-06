import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useAppDispatch as useDispatch } from '../../hooks';
import { updateHashesFlag } from './geojsonFieldSlice';

interface HashTable {
  [key: string]: string | number | null;
}
const GeojsonFieldHashTablesServer = () => {
  const dispatch = useDispatch();
  const [variables, setVariables] = useState([]);
  const variablesRef = useRef([]);
  const [hashTables, setHashTables] = useState([]);
  const [exportHashTables, setExportHashTables] = useState([]);
  const [initRender, setInitRender] = useState(true);

  const getHashTables = (): HashTable[] | null => {
    let hashes = sessionStorage.getItem('geojsonFieldHashes');
    if (hashes === null) {
      sessionStorage.setItem('geojsonFieldHashes', JSON.stringify([]));
      hashes = sessionStorage.getItem('geojsonFieldHashes');
    }
    if (hashes === null) return null;
    return JSON.parse(hashes);
  };

  const appendHash = (val: HashTable) => {
    const hashes = getHashTables();
    if (hashes === null) return;
    hashes.push(val);
    sessionStorage.setItem('geojsonFieldHashes', JSON.stringify(hashes));
    const updatedHashesString = sessionStorage.getItem('geojsonFieldHashes');
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
    sessionStorage.setItem('geojsonFieldHashes', JSON.stringify(concatHashes));
    const updatedHashesString = sessionStorage.getItem('geojsonFieldHashes');
    if (updatedHashesString === null) return;
    const updatedHashes = JSON.parse(updatedHashesString);
    setHashes(updatedHashes);
  };

  const [hashes, setHashes] = useState(getHashTables);

  const memoizedVariables = useMemo(
    () => ({
      variables,
    }),
    [variables],
  );

  useEffect(() => {
    const fetchVariables = async () => {
      const response = await fetch('http://localhost:8080/getVariables/');
      const json = await response.json();
      setVariables(json);
    };
    fetchVariables();
  }, []);

  const fetchVariableHashes = async (varname: string) => {
    const response = await fetch(
      `http://localhost:8080/variableHash?varname=${varname}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const json = await response.json();
    appendHashes(json);
  };

  useEffect(() => {
    const newVariables = variables.filter(
      (item) => !variablesRef.current.includes(item),
    );
    newVariables.map((variable) => fetchVariableHashes(variable));
  }, [memoizedVariables]);

  return hashes;
};

const useHashTables = () => {
  const hashes = sessionStorage.getItem('geojsonFieldHashes');
  return hashes == null ? [] : JSON.parse(hashes);
};

export default GeojsonFieldHashTablesServer;
