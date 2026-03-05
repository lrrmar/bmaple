import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import {
  BackendDiscreteMetaData,
  DiscreteMetaData,
  selectBackendDiscreteMetaData,
  selectReadableNames,
  updateContinuousMetaDataLocks,
  updateDiscreteMetaDataSelections,
  updateProfileIds,
  updateSelectedResources,
  selectProfileIds,
  updateOpacity,
  selectOpacity,
  updateStrokeColour,
  selectStrokeColour,
  updateStrokeWidth,
  selectStrokeWidth,
  selectApiUrl,
} from '../modules/simple-tiles/simpleTileSlice';

import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

const TileListMenu = () => {
  const dispatch = useDispatch();
  const [hashes, setHashes] = useState<
    {
      file: string;
      uri: string;
      id: string;
      timestamp: string;
    }[]
  >([]);
  const [menuItems, setMenuItems] = useState<React.ReactNode[]>([]);

  const backendDiscreteMetaData = useSelector(selectBackendDiscreteMetaData);
  const strokeColour = useSelector(selectStrokeColour);
  const strokeWidth = useSelector(selectStrokeWidth);
  const apiUrl = useSelector(selectApiUrl);

  useEffect(() => {
    const getHashes = async () => {
      const response = await fetch(`${apiUrl}/hashes?normalised=false`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      const json = await response.json();
      setHashes(json);
    };
    getHashes();
  }, []);

  useEffect(() => {
    if (hashes) {
      setMenuItems(
        hashes.map((hash) => {
          return (
            <MenuItem key={hash.id} value={hash.id}>
              {hash.file}
            </MenuItem>
          );
        }),
      );
    }
  }, [hashes]);

  return (
    <Stack>
      <br></br>
      <p>Tileset</p>
      <Select
        onChange={(e) => {
          if (typeof e.target.value === 'string') {
            dispatch(updateProfileIds({ host: '0', resource: e.target.value }));
          }
        }}
        sx={{ bgcolor: '#ffffff' }}
      >
        {menuItems}
      </Select>
      <br></br>
      <p>Stroke Width</p>
      <Slider
        getAriaLabel={() => 'Stroke width'}
        value={strokeWidth}
        min={0.05}
        max={5.0}
        step={0.05}
        onChange={(e: Event, value: number | number[]) => {
          if (typeof value == 'number') dispatch(updateStrokeWidth(value));
        }}
      />
      <br></br>
      <p>Stroke colour e.g. #000000 or rgb(0,0,0)</p>
      <TextField
        value={strokeColour}
        onChange={(e: object) => {
          const event = e as Event;
          if (event.target)
            dispatch(
              updateStrokeColour((event.target as HTMLInputElement).value),
            );
        }}
        sx={{ bgcolor: '#ffffff' }}
      />
    </Stack>
  );
};

export default TileListMenu;
