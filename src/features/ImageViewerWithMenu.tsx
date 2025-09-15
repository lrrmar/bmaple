import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Icon } from 'semantic-ui-react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import { selectCache } from '../mapping/cacheSlice';
import {
  updateDisplayTimes,
  updateVerticalLevels,
  selectIsoDisplayTime,
  selectVerticalLevel,
} from '../mapping/mapSlice';

import CanvasImgViewPortPreloaded from './CanvasImgViewPortPreloaded';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {
  BackendDiscreteMetaData,
  DiscreteMetaData,
  selectBackendDiscreteMetaData,
  selectReadableNames,
  updateContinuousMetaDataLocks,
  updateDiscreteMetaDataSelections,
  updateSelectedResources,
  selectProfileIds,
} from '../modules/force-nwr/forceNwrSlice';

type DiscreteHeader = 'domain' | 'field' | 'start_time';
type ContinuousHeader = 'valid_time' | 'level';
interface MetaData {
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
}

const HeaderLock = ({
  header,
  current,
  locked,
  setLocked,
}: {
  header: string;
  current: string | null;
  locked: string | null;
  setLocked: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  return (
    <div>
      {header}
      <button onClick={() => (locked ? setLocked(null) : setLocked(current))}>
        <Icon name={locked ? 'lock open' : 'lock'} />
      </button>
      {locked ? locked : ''}
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
  const cache = useSelector(selectCache);
  const displayTime = useSelector(selectIsoDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const profileIds = useSelector(selectProfileIds);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selection, setSelection] = useState<DiscreteMetaData | null>({
    domain: null,
    field: null,
    start_time: null,
  });
  const selectionRef = useRef<DiscreteMetaData | null>(null);
  const backendDiscreteMetaData = useSelector(selectBackendDiscreteMetaData);
  const readableNames = useSelector(selectReadableNames);
  //const [backendDiscreteMetaData, setMetaData] = useState<MetaData | null>(null);
  const [validTimeLocked, setValidTimeLocked] = useState<string | null>(null);
  const [levelLocked, setLevelLocked] = useState<string | null>(null);
  const [currentHashes, setCurrentHashes] = useState<Hash[]>([]);
  const [menus, setMenus] = useState<React.ReactNode | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [resourceLoaded, setResourceLoaded] = useState<boolean>(false);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // on initial render, see if a previous selection has been saved in
    // selectionRef i.e. due to a change in tiling
    if (selectionRef.current) {
      setSelection(selectionRef.current);
    }
  }, []);

  useEffect(() => {
    // After any selection change, store a copy in selectionRef
    if (selection) selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    // Generate drop down for each heading
    if (backendDiscreteMetaData) {
      const discreteHeaders = backendDiscreteMetaData.headers;
      const values = backendDiscreteMetaData.values;
      const tables = backendDiscreteMetaData.tables;
      if (!selection) {
        //Get initial selection
        /*const newSelection = {
          field: values['field'][0],
          domain: values['domain'][0],
          start_time: values['start_time'][0],
        };
        setSelection(newSelection);*/
        return;
      }
      const selects = discreteHeaders.map(
        (thisDiscreteHeader: DiscreteHeader, i) => {
          // First find out which value we have valid hash tables
          // for by checking against the metadata tables for each
          // other header
          const thisDiscreteHeaderValues = values[thisDiscreteHeader];
          const thisDiscreteHeaderTables = tables[thisDiscreteHeader];
          const otherDiscreteHeaders = [...discreteHeaders];
          otherDiscreteHeaders.splice(i, 1);

          // Assume true i.e. 1 -> there exists a hash table that contains each of
          // those values for each header
          let hashAvailableBools: number[] = new Array(
            thisDiscreteHeaderValues.length,
          ).fill(1);
          otherDiscreteHeaders.forEach((otherDiscreteHeader) => {
            // Other headers current selection
            const otherDiscreteHeaderSelection = selection[otherDiscreteHeader];
            if (typeof otherDiscreteHeaderSelection === 'string') {
              const otherSelection: number = values[
                otherDiscreteHeader
              ].indexOf(otherDiscreteHeaderSelection);
              // Get boolean array for header + otherDiscreteHeader, i.e.
              // check to see what matches in dicsrete metadata we have

              const array = thisDiscreteHeaderTables[otherDiscreteHeader].map(
                (row) => row[otherSelection],
              );
              hashAvailableBools = hashAvailableBools.map(
                (val, i) => val & array[i],
              );
            } else {
              hashAvailableBools = new Array(
                thisDiscreteHeaderValues.length,
              ).fill(0);
            }
          });
          const menuItems = thisDiscreteHeaderValues.map((val, i) => {
            const sx = {
              color: hashAvailableBools[i] ? '#000000' : '#888888',
            };
            return (
              <MenuItem key={val} value={i} sx={sx}>
                {readableNames && readableNames[val] ? readableNames[val] : val}
              </MenuItem>
            );
          });
          console.log(selection[thisDiscreteHeader]);
          let displayName = '...';
          if (selection[thisDiscreteHeader]) {
            displayName = selection[thisDiscreteHeader];
            if (readableNames && readableNames[displayName]){
              displayName = readableNames[selection[thisDiscreteHeader]];

            }
          }
          const select = (
            <div key={thisDiscreteHeader}>
              <InputLabel
                id={`${thisDiscreteHeader} label`}
                style={{ color: 'white' }}
              >
                {readableNames && readableNames[thisDiscreteHeader]
                  ? readableNames[thisDiscreteHeader]
                  : thisDiscreteHeader}
              </InputLabel>
              <Select
                labelId={`${thisDiscreteHeader} label`}
                //value={selection[thisDiscreteHeader]}
                renderValue={(val: string) => {
                  return val;
                }}
                style={{ color: 'white' }}
                onChange={(e) => {
                  if (typeof e.target.value === 'number') {
                    const newSelection: DiscreteMetaData = {
                      ...selection,
                    };
                    newSelection[thisDiscreteHeader] =
                      thisDiscreteHeaderValues[e.target.value];
                    setSelection(newSelection);
                  }
                }}
                input={
                  <OutlinedInput
                    value={
                      displayName
                    }
                  />
                }
              >
                {menuItems}
              </Select>
            </div>
          );
          return select;
        },
      );

      const continuousHeaders = ['valid_time', 'level'];

      selects.push(
        <HeaderLock
          key={'valid_time'}
          header={'valid_time'}
          current={displayTime}
          locked={validTimeLocked}
          setLocked={setValidTimeLocked}
        />,
      );
      selects.push(
        <HeaderLock
          key={'level'}
          header={'level'}
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
    validTimeLocked,
    levelLocked,
    selection,
  ]);

  useEffect(() => {
    dispatch(
      updateDiscreteMetaDataSelections({
        id: id.toString(),
        selection: selection,
      }),
    );
  }, [selection]);

  useEffect(() => {
    dispatch(
      updateContinuousMetaDataLocks({
        id: id.toString(),
        locks: {
          valid_time: validTimeLocked,
          level: levelLocked,
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
    if (resourceId) {
      setResourceLoaded(!!cache[resourceId]);
    } else {
      setResourceLoaded(false);
    }
  }, [resourceId, cache]);

  useEffect(() => {
    const profileId = profileIds[id.toString()];
    if (profileId) {
      setProfileId(profileId);
    }
  }, [profileIds]);

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
          name="angle down"
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
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
            left: menuOpen ? '' : '-1000vw',
            position: 'absolute',
            backgroundColor: '#555555',
            padding: '1em',
          }}
        >
          {menus}
        </div>
        <CanvasImgViewPortPreloaded
          id={profileId && !hidden ? 'img' + profileId : null}
          configChange={configChange}
        />
      </div>
    </div>
  );
};

export default ImageViewerWithMenu;
