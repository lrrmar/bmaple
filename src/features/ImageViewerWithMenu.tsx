import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Icon } from 'semantic-ui-react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import { selectCache } from '../mapping/cacheSlice';
import {
  selectIsoDisplayTime,
  selectVerticalLevel,
  selectVerticalLevels,
  updateVerticalLevels,
} from '../mapping/mapSlice';

import CanvasImgViewPortPreloaded from './CanvasImgViewPortPreloaded';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {
  BackendDiscreteMetaData,
  DiscreteHeader,
  DiscreteMetaData,
  selectBackendDiscreteMetaData,
  selectReadableNames,
  updateContinuousMetaDataLocks,
  updateDiscreteMetaDataSelections,
  updateSelectedResources,
  selectProfileIds,
  selectApiUrl,
} from '../modules/force-nwr/forceNwrSlice';

type ContinuousHeader = 'valid_time' | 'level';
/*interface MetaData {
  headers: DiscreteHeader[];
  values: { [key in DiscreteHeader]: string[] };
  tables: { [key in DiscreteHeader]: { [key: string]: (0 | 1)[][] } };
}
interface Hash {
  [key: string]: string;
  id: string;
  domain: string;
  field: string;
  valid_time: string;
  start_time: string;
  level: string;
}

interface Selection {
  [key: string]: number;
}

interface Query {
  domain: string | null;
  field: string | null;
  valid_time: string | null;
  start_time: string | null;
  level: string | null;
}*/
type Locked = { value: string | null; strong: boolean };

const HeaderLock = ({
  header,
  current,
  locked,
  setLocked,
}: {
  header: string;
  current: string | null;
  locked: Locked;
  setLocked: React.Dispatch<React.SetStateAction<Locked>>;
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {header}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {locked.value ? locked.value : '...'}
        <Icon
          name={locked.value ? 'lock' : 'lock open'}
          color={locked.value ? (locked.strong ? 'grey' : 'red') : 'black'}
          onClick={() =>
            locked.value
              ? locked.strong
                ? void 0
                : setLocked({ value: null, strong: false })
              : setLocked({ value: current, strong: false })
          }
        />
      </div>
    </div>
  );
};

const ImageViewerWithMenu = ({
  id,
  apiUrl,
  configChange,
  hidden,
}: {
  id: number;
  apiUrl: string;
  configChange: string;
  hidden?: boolean;
}) => {
  const dispatch = useDispatch();
  const displayTime = useSelector(selectIsoDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const verticalLevels = useSelector(selectVerticalLevels);
  const profileIds = useSelector(selectProfileIds);
  const backendDiscreteMetaData = useSelector(selectBackendDiscreteMetaData);
  const readableNames = useSelector(selectReadableNames);
  const cache = useSelector(selectCache);

  const [profileId, setProfileId] = useState<string | null>(null);
  const [selection, setSelection] = useState<DiscreteMetaData | null>(null);
  const selectionRef = useRef<DiscreteMetaData | null>({
    domain: null,
    field: null,
    start_time: null,
    plot: null,
    location: null,
  });
  const verticalLevelsRef = useRef<string[]>([]);
  const [validTimeLocked, setValidTimeLocked] = useState<Locked>({
    value: null,
    strong: false,
  });
  const [levelLocked, setLevelLocked] = useState<Locked>({
    value: null,
    strong: false,
  });
  const [menus, setMenus] = useState<React.ReactNode | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [resourceLoaded, setResourceLoaded] = useState<boolean>(false);
  const [aggregates, setAggregates] = useState<BackendDiscreteMetaData>({
    domain: [],
    field: [],
    start_time: [],
    plot: [],
    location: [],
  });

  const fetchDiscreteAggregates = async (selection: Partial<DiscreteMetaData>) => {
    const body: Record<string, string> = {};
    Object.entries(selection).map(([key, val]) => {
      if (val) body[key] = val;
    });

    const response = await fetch(`${apiUrl}/getAggregates/`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    setAggregates(json);
  };

  useEffect(() => {
    // on initial render, see if a previous selection has been saved in
    // selectionRef
    setSelection(selectionRef.current);
    fetchDiscreteAggregates({});
  }, []);

  useEffect(() => {
    // If new selection different from Ref, remove all locks
    if (JSON.stringify(selectionRef.current) !== JSON.stringify(selection)) {
      setLevelLocked({ value: null, strong: false });
      setValidTimeLocked({ value: null, strong: false });
    }

    // After any selection change, store a copy in selectionRef
    if (selection) selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    // Generate drop down for each heading
    if (backendDiscreteMetaData) {
      const entries = Object.entries(backendDiscreteMetaData) as [
        DiscreteHeader,
        string[],
      ][];
      const selects: React.ReactNode[] = [];
      for (let i = 0; i < entries.length; i++) {
        // First find out which value we have valid hash tables
        // for by checking against the metadata tables for each
        // other header
        const header = entries[i][0];
        const values = entries[i][1];

        const menuItems = values.map((val, i) => {
          let color = '#c0c0c0';
          if (aggregates[header] && aggregates[header].includes(val)) {
            color = '#000000';
          }
          const sx = {
            color: color,
          };
          return (
            <MenuItem key={val} value={i} sx={sx}>
              {readableNames && readableNames[val] ? readableNames[val] : val}
            </MenuItem>
          );
        });
        let displayName = '...';
        const selectionHeader = selection ? selection[header] : null;

        if (selectionHeader) {
          displayName = selectionHeader;
          if (readableNames && readableNames[displayName]) {
            displayName = readableNames[selectionHeader];
          }
        }
        const select = (
          aggregates[header].length > 0 ? <div key={header}>
            <InputLabel style={{ color: '#0f0f0f' }} id={`${header} label`}>
              {readableNames && readableNames[header]
                ? readableNames[header]
                : header}
            </InputLabel>
            <Select
              labelId={`${header} label`}
              //value={selection[thisDiscreteHeader]}
              renderValue={(val: string) => {
                return val;
              }}
              onChange={(e) => {
                if (typeof e.target.value === 'number') {
                  if (selection) {
                    const newSelection = {
                      ...selection,
                    };
                    newSelection[header] = values[e.target.value];
                    setSelection(newSelection);
                  }
                }
              }}
              input={<OutlinedInput value={displayName} />}
            >
              {menuItems}
            </Select>
          </div> : <></>
        );
        selects.push(
          <div key={header}>
            {select}
            <br />
          </div>,
        );
      }

      selects.push(
        <HeaderLock
          key={'valid_time'}
          header={
            readableNames && readableNames['valid_time']
              ? readableNames['valid_time']
              : ' Valid Time '
          }
          current={displayTime}
          locked={validTimeLocked}
          setLocked={setValidTimeLocked}
        />,
      );

      selects.push(<br />);
      selects.push(
        <HeaderLock
          key={'level'}
          header={
            readableNames && readableNames['level']
              ? readableNames['level']
              : ' Vertical Level'
          }
          current={verticalLevel}
          locked={levelLocked}
          setLocked={setLevelLocked}
        />,
      );
      setMenus(selects);
    }
  }, [
    readableNames,
    backendDiscreteMetaData,
    aggregates,
    validTimeLocked,
    levelLocked,
    displayTime,
    verticalLevel,
    selection,
  ]);

  useEffect(() => {
    dispatch(
      updateDiscreteMetaDataSelections({
        id: id.toString(),
        selection: selection,
      }),
    );
    if (
      selection && // selection is not null
      Object.values(selection).some((val) => !!val) // some options not null
    )
      fetchDiscreteAggregates(selection);
  }, [selection]);

  useEffect(() => {
    dispatch(
      updateContinuousMetaDataLocks({
        id: id.toString(),
        locks: {
          valid_time: validTimeLocked.value,
          level: levelLocked.value,
        },
      }),
    );
  }, [validTimeLocked, levelLocked]);

  /* useEffect(() => {
    // On hash change, get times and levels from hashes
    if (currentHashes.length > 0) {
      const timeStrings = [
        ...new Set(currentHashes.map((hash) => hash.valid_time)),
      ];
      const levels = [...new Set(currentHashes.map((hash) => hash.level))];
      if (timeStrings && levels) {
        {
          /*const allLevels = [
          'single',
          'p',
        ];
        const orderedLevels = allLevels.filter((level) =>
          levels.includes(level),
        );*/
  /* }
        const orderedLevels = levels;
        const times = timeStrings
          .map((timeString) => new Date(timeString).getTime())
          .sort();
        if (times && orderedLevels) {
          dispatch(updateDisplayTimes({ source: 'one', times: times }));
          dispatch(updateVerticalLevels(orderedLevels));
        }
      }
    }
  }, [currentHashes]);

  useEffect(() => {
    if (selection && !hidden) {
      const query: Query = {
        ...selection,
        valid_time: validTimeLocked
          ? validTimeLocked.replace('.00', '')
          : displayTime.replace('.00', ''),
        level: levelLocked ? levelLocked : verticalLevel,
      };
      if (Object.values(query).every((val) => !!val)) {
        const thisHash = currentHashes.find((dict: Hash) =>
          Object.entries(query).every(([key, value]) => {
            const match = dict[key];
            if (match) return match == value;
          }),
        );
        if (thisHash) {
          setResourceId(thisHash.id);
          dispatch(
            updateSelectedResources({ viewId: id, resourceId: thisHash.id }),
          );
        } else {
          setResourceId(null);
          dispatch(updateSelectedResources({ viewId: id, resourceId: null }));
        }
      }
    }
  }, [selection, displayTime, verticalLevel, currentHashes]);
   */
  useEffect(() => {
    //setResourceLoaded(false);
    if (profileId) {
      setResourceLoaded(!!cache[profileId]);
    }
  }, [profileId, cache]);

  useEffect(() => {
    const profileId = profileIds[id.toString()];
    if (profileId) {
      setProfileId(profileId);
    } else {
      setProfileId(null);
    }
  }, [profileIds]);

  useEffect(() => {
    // Save verticalLevels in Ref and
    // Auto lock if transferring from a single level to multi

    const levels = verticalLevels['force-nwr' + id];
    // The length > 0 below is to counteract the setting of these levels to []
    // below on change of 'hidden', i.e. stores the last valid levels
    if (levels && levels.length > 0) verticalLevelsRef.current = levels;
    if (levels && levels.length == 1)
      setLevelLocked({ value: levels[0], strong: true });
  }, [verticalLevels]);

  useEffect(() => {
    // Clean up on close

    // Remove vertical levels on close of ImageViewer i.e. from single to duo
    const levels = verticalLevels['force-nwr' + id];
    if (hidden && levels && levels.length > 0)
      dispatch(updateVerticalLevels({ source: 'force-nwr' + id, levels: [] }));

    // Remove selection on close of ImageViewer
    if (hidden && selection) setSelection(null);

    // Start up on open
    if (!hidden) {
      setSelection(selectionRef.current);
      dispatch(
        updateVerticalLevels({
          source: 'force-nwr' + id,
          levels: verticalLevelsRef.current,
        }),
      );
    }
  }, [hidden]);

  return (
    <div
      style={{
        padding: '0.5em',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'centre',
        alignItems: 'centre',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          padding: '2em',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          borderRadius: '1em',
        }}
      >
        <Icon
          onClick={() => setMenuOpen(!menuOpen)}
          name={menuOpen ? 'angle up' : 'angle down'}
          circular={true}
          size={'large'}
          style={{
            backgroundColor: menuOpen ? 'black' : 'rgba(255,255,255,0.5)',
            color: menuOpen ? 'white' : 'black',
            backdropFilter: 'blur(10px)',
            width: '2em',
            height: '2em',
            left: '-0.5em',
            top: '-0.5em',
            position: 'absolute',
            borderRadius: '1em',
            zIndex: '30',
          }}
        />
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1em',
            left: menuOpen ? '' : '-1000vw',
            position: 'absolute',
            padding: '1em',
            borderStyle: 'solid',
            borderColor: 'black',
          }}
        >
          {menus}
        </div>
        <CanvasImgViewPortPreloaded
          profileId={
            profileId && !hidden && resourceLoaded ? 'img' + profileId : null
          }
          configChange={configChange}
        />
      </div>
    </div>
  );
};

export default ImageViewerWithMenu;
