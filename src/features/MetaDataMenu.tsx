import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {
  DiscreteMetaData,
  selectDiscreteMetaData,
  updateDiscreteMetaData,
} from '../modules/teamx/teamxSlice';

type Header = 'run' | 'region' | 'field';
interface MetaData {
  headers: Header[];
  values: { [key in Header]: string[] };
  tables: { [key in Header]: { [key: string]: (0 | 1)[][] } };
}

interface Selection {
  [key: string]: number;
}

const MetaDataMenu = () => {
  const dispatch = useDispatch();
  const selection = useSelector(selectDiscreteMetaData);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [menus, setMenus] = useState<React.ReactNode | null>(null);
  const fetchMetaData = async () => {
    const apiUrl = 'http://localhost:8383';
    const response = await fetch(`${apiUrl}/getDiscreteMetaData/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await response.json();
    setMetaData(json);
  };

  useEffect(() => {
    // on initial render, fetch meta data
    if (metaData) return;
    fetchMetaData();
  }, []);

  useEffect(() => {
    // Generate drop down for each heading

    if (metaData) {
      const headers = metaData.headers;
      const values = metaData.values;
      const tables = metaData.tables;
      const selects = headers.map((header: Header, i) => {
        // First find out which value we have valid hash tables
        // for by checking against the metadata tables for each
        // other header
        const headerValues = values[header];
        const headerTables = tables[header];
        const otherHeaders = [...headers];
        otherHeaders.splice(i, 1);

        // Assum true i.e. 1 -> there exists a hash table that contains each of
        // those values for each header
        let hashAvailableBools: number[] = new Array(headerValues.length).fill(
          1,
        );
        otherHeaders.forEach((otherHeader) => {
          // Other headers current selection
          const otherSelection: number = selection[otherHeader];
          const array = headerTables[otherHeader].map(
            (row) => row[otherSelection],
          );
          hashAvailableBools = hashAvailableBools.map(
            (val, i) => val & array[i],
          );
        });
        console.log(header, hashAvailableBools);
        const menuItems = headerValues.map((val, i) => {
          const sx = {
            color: hashAvailableBools[i] ? '#000000' : '#888888',
          };
          return (
            <MenuItem key={val} value={i} sx={sx}>
              {val}
            </MenuItem>
          );
        });
        console.log(selection);
        const select = (
          <div>
            <InputLabel id={`${header} label`}>{header}</InputLabel>
            <Select
              labelId={header}
              value={selection[header]}
              onChange={(e) => {
                if (typeof e.target.value === 'number') {
                  const newSelection = { ...selection };
                  newSelection[header] = e.target.value;
                  console.log(newSelection);
                  dispatch(updateDiscreteMetaData(newSelection));
                }
              }}
              input={<OutlinedInput />}
            >
              {menuItems}
            </Select>
          </div>
        );
        return select;
      });
      setMenus(selects);
    }
  }, [metaData, selection]);

  return <div>{menus}</div>;
};

export default MetaDataMenu;
