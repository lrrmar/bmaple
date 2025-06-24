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

type Header = 'run' | 'region' | 'field' | 'start_time';
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
      const allSelectionsNull = !Object.values(selection).reduce(
        (acc, curr) => {
          return !!acc || !!curr;
        },
        false,
      );
      if (allSelectionsNull) {
        //Get initial selection
        const newSelection = {
          region: values['region'][0],
          field: values['field'][0],
          run: values['run'][0],
          start_time: values['start_time'][0],
        };
        dispatch(updateDiscreteMetaData(newSelection));
        return;
      }
      const selects = headers.map((thisHeader: Header, i) => {
        // First find out which value we have valid hash tables
        // for by checking against the metadata tables for each
        // other header
        const thisHeaderValues = values[thisHeader];
        const thisHeaderTables = tables[thisHeader];
        const otherHeaders = [...headers];
        otherHeaders.splice(i, 1);

        // Assume true i.e. 1 -> there exists a hash table that contains each of
        // those values for each header
        let hashAvailableBools: number[] = new Array(
          thisHeaderValues.length,
        ).fill(1);
        otherHeaders.forEach((otherHeader) => {
          // Other headers current selection
          const otherHeaderSelection = selection[otherHeader];
          if (typeof otherHeaderSelection === 'string') {
            const otherSelection: number =
              values[otherHeader].indexOf(otherHeaderSelection);
            // Get boolean array for header + otherHeader, i.e.
            // check to see what matches in dicsrete metadata we have

            const array = thisHeaderTables[otherHeader].map(
              (row) => row[otherSelection],
            );
            hashAvailableBools = hashAvailableBools.map(
              (val, i) => val & array[i],
            );
          } else {
            hashAvailableBools = new Array(thisHeaderValues.length).fill(0);
          }
        });
        const menuItems = thisHeaderValues.map((val, i) => {
          const sx = {
            color: hashAvailableBools[i] ? '#000000' : '#888888',
          };
          return (
            <MenuItem key={val} value={i} sx={sx}>
              {val}
            </MenuItem>
          );
        });
        const select = (
          <div>
            <InputLabel id={`${thisHeader} label`} style={{ color: 'white' }}>
              {thisHeader}
            </InputLabel>
            <Select
              labelId={thisHeader}
              value={selection[thisHeader]}
              style={{ color: 'white' }}
              onChange={(e) => {
                if (typeof e.target.value === 'number') {
                  const newSelection: DiscreteMetaData = {
                    ...selection,
                  };
                  newSelection[thisHeader] = thisHeaderValues[e.target.value];
                  dispatch(updateDiscreteMetaData(newSelection));
                }
              }}
              input={<OutlinedInput value={selection[thisHeader]} />}
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
