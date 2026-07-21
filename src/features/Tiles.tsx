import React, { useEffect, useState } from 'react';
import ImageViewerWithMenu from './ImageViewerWithMenu';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

type TileConfigurations = 'single' | 'duo' | 'trio' | 'quad' | 'bottom bar';

const isTileConfigurations = (e: any): e is TileConfigurations => {
  return ['single', 'duo', 'trio', 'quad', 'bottom bar'].includes(e);
};
const Tiles = ({ apiUrl }: { apiUrl: string }) => {
  const [tileIndex, setTileIndex] = useState<{
    0: number;
    1: number;
    2: number;
    3: number;
  }>({ 0: 0, 1: 1, 2: 2, 3: 3 });
  const [configuration, setConfiguration] =
    useState<TileConfigurations>('single');

  const tileConfigurations: TileConfigurations[] = [
    'single',
    'duo',
    'trio',
    //'quad',
    //'bottom bar',
  ];

  const baseTile: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
  };

  const baseRow: React.CSSProperties = {
    ...baseTile,
    display: 'flex',
    flexWrap: 'wrap',
  };

  const hiddenTile: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    left: '-1000vw',
  };
  const hiddenRow: React.CSSProperties = hiddenTile;

  const tileStyles: { [key: string]: React.CSSProperties } = {
    single0: baseTile,
    single1: hiddenTile,
    single2: hiddenTile,
    single3: hiddenTile,
    duo0: { ...baseTile, width: '50%' },
    duo1: { ...baseTile, width: '50%' },
    duo2: hiddenTile,
    duo3: hiddenTile,
    trio0: { ...baseTile, width: '33.33%' },
    trio1: { ...baseTile, width: '33.33%' },
    trio2: { ...baseTile, width: '33.33%' },
    trio3: hiddenTile,
    quad0: { ...baseTile, width: '50%', height: '50%' },
    quad1: { ...baseTile, width: '50%', height: '50%' },
    quad2: { ...baseTile, width: '50%', height: '50%' },
    quad3: { ...baseTile, width: '50%', height: '50%' },
    'bottom bar0': { ...baseTile, width: '50%', height: '50%' },
    'bottom bar1': { ...baseTile, width: '50%', height: '50%' },
    'bottom bar2': { ...baseTile, width: '100%', height: '50%' },
    'bottom bar3': hiddenTile,
  };

  const viewerCount = {
    single: 1,
    duo: 2,
    trio: 3,
    quad: 4,
    'bottom bar': 5,
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={baseRow}>
        <div style={tileStyles[configuration + '0']}>
          <ImageViewerWithMenu
            id={0}
            apiUrl={apiUrl}
            configChange={configuration}
            hidden={1 > viewerCount[configuration]}
          />
        </div>
        <div style={tileStyles[configuration + '1']}>
          <ImageViewerWithMenu
            id={1}
            apiUrl={apiUrl}
            configChange={configuration}
            hidden={2 > viewerCount[configuration]}
          />
        </div>
        <div style={tileStyles[configuration + '2']}>
          <ImageViewerWithMenu
            id={2}
            apiUrl={apiUrl}
            configChange={configuration}
            hidden={3 > viewerCount[configuration]}
          />
        </div>
        <div style={tileStyles[configuration + '3']}>
          <ImageViewerWithMenu
            id={3}
            apiUrl={apiUrl}
            configChange={configuration}
            hidden={4 > viewerCount[configuration]}
          />
        </div>
      </div>
      <div style={{ alignSelf: 'flex-end' }}>
        <Select
          value={configuration}
          input={<OutlinedInput value={configuration} />}
          style={{
            backgroundColor: 'rgba(255,255,255,1)',
            backdropFilter: 'blur(10px)',
            margin: '0.5em',
            borderRadius: '1em',
          }}
          onChange={(e) => {
            const conf = e.target.value;
            if (isTileConfigurations(conf)) setConfiguration(conf);
          }}
        >
          {tileConfigurations.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default Tiles;
