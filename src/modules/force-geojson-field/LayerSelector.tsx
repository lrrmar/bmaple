import React, { useEffect, useState, useRef } from 'react';
import { Button, ButtonGroup, Icon, Dropdown } from 'semantic-ui-react';
import DropDownList from '../../features/DropDownList';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import LoadingSpinner from '../../features/LoadingSpinner';
import {
  updateDisplayTime,
  selectDisplayTime,
  updateVerticalLevel,
  selectVerticalLevel,
} from '../../mapping/mapSlice';
import { HashTable } from './geojsonFieldHashTables';

import {
  updateSelectedId,
  selectProfileId,
  selectSelectedId,
  selectHashTables,
  selectHashesFlag,
  selectApiUrl,
} from './geojsonFieldSlice';

const isString = (x: any) => !!x && typeof x === 'string';

const LayerSelector = () => {
  const dispatch = useDispatch();
  const validTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const geojsonFieldHashesFlag = useSelector(selectHashesFlag);
  const profileId = useSelector(selectProfileId);
  const selectedId = useSelector(selectSelectedId);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableVarnames, setAvailableVarnames] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableValidTimes, setAvailableValidTimes] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const varname = useRef<string>('');
  const domain = useRef<string>('');
  const startTime = useRef<string>('');
  const variableHashes: HashTable[] = useSelector(selectHashTables);
  const apiUrl: string = useSelector(selectApiUrl);
  const [animate, setAnimate] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [pulseInterval, setPulseInterval] = useState(1000);
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
  };

  useEffect(() => {
    /* Initial selection / positioning
     *         */
    if (variableHashes.length === 0) {
      return;
    }
    varname.current == '' ? (varname.current = variableHashes[0].varname) : {};
    domain.current = variableHashes[0].grid_id.toString();
    startTime.current = variableHashes[0].sim_start_time;
    dispatch(updateDisplayTime(variableHashes[0].valid_time));
    dispatch(updateVerticalLevel(variableHashes[0].level_type));
    setAvailableVarnames([
      ...new Set(
        variableHashes.map((hash) => {
          return hash['varname'];
        }),
      ),
    ]);
    setAvailableDomains(
      [
        ...new Set(
          variableHashes.map((hash) => {
            return hash['grid_id'].toString();
          }),
        ),
      ].sort(),
    );
    setAvailableStartTimes(
      [
        ...new Set(
          variableHashes.map((hash) => {
            return hash['sim_start_time'];
          }),
        ),
      ].sort(),
    );
    setAvailableValidTimes([
      ...new Set(
        variableHashes.map((hash) => {
          return hash['valid_time'];
        }),
      ),
    ]);
    setAvailableLevels([
      ...new Set(
        variableHashes.map((hash) => {
          return hash['level_type'];
        }),
      ),
    ]);
    setAvailableValidTimes((current) => current.sort());
    setAvailableLevels((current) => current.sort());
  }, [geojsonFieldHashesFlag]);

  useEffect(() => {
    /* Handle selection change
     *          */
    const layerMetaData = {
      varname: varname.current,
      sim_start_time: startTime.current,
      valid_time: validTime,
      level_type: verticalLevel,
      grid_id: domain.current,
    };
    console.log(layerMetaData);
    const layerHash = variableHashes.find((dict) =>
      Object.entries(layerMetaData).every(
        ([key, value]) => dict[key] === value,
      ),
    );
    if (layerHash) {
      const newHash = { ...layerHash, id: layerHash.id };
      dispatch(updateSelectedId(newHash.id));
    } else {
      dispatch(updateSelectedId(null));
    }
  }, [varname, startTime, validTime, verticalLevel, domain]);

  useEffect(() => {
    const doPulse = () => setPulse((currentPulse) => currentPulse + 1);
    const interval = setInterval(doPulse, pulseInterval);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (animate) {
      const currentIndex = availableValidTimes.indexOf(validTime);
      if (currentIndex === availableValidTimes.length - 1) {
        return;
      }
      dispatch(updateDisplayTime(availableValidTimes[currentIndex + 1]));
    }
  }, [pulse]);

  useEffect(() => {
    /* handle isLoading */
    if (!profileId || !selectedId) return;
    if (profileId !== selectedId) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [selectedId, profileId]);

  return (
    <div style={style}>
      {/*isLoading && <LoadingSpinner />*/}
      <label htmlFor="varname">Variable:</label>
      <DropDownList
        values={availableVarnames}
        value={varname.current}
        setValue={(v: string) => (varname.current = v)}
      />
      <span>
        Domain:
        <DropDownList
          values={availableDomains}
          value={domain.current}
          setValue={(d: string) => (domain.current = d)}
        />
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableDomains.indexOf(domain.current);
            if (currentIndex === 0) {
              return;
            }
            domain.current = availableDomains[currentIndex - 1];
          }}
        >
          <Icon name="angle left" />
        </Button>
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableDomains.indexOf(domain.current);
            if (currentIndex === availableDomains.length - 1) {
              return;
            }
            domain.current = availableDomains[currentIndex + 1];
          }}
        >
          <Icon name="angle right" />
        </Button>
      </span>
      <span>
        <label htmlFor="startTime">Start time:</label>
        <DropDownList
          values={availableStartTimes}
          value={startTime.current}
          setValue={(s: string) => (startTime.current = s)}
        />
      </span>
      <span>
        Valid time:
        <DropDownList
          values={availableValidTimes}
          value={validTime}
          setValue={(time: string) => dispatch(updateDisplayTime(time))}
        />
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableValidTimes.indexOf(validTime);
            if (currentIndex === 0) {
              return;
            }
            dispatch(updateDisplayTime(availableValidTimes[currentIndex - 1]));
          }}
        >
          <Icon name="angle left" />
        </Button>
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableValidTimes.indexOf(validTime);
            if (currentIndex === availableValidTimes.length - 1) {
              return;
            }
            dispatch(updateDisplayTime(availableValidTimes[currentIndex + 1]));
          }}
        >
          <Icon name="angle right" />
        </Button>
        <Button
          icon
          size="mini"
          onClick={() => {
            setAnimate(!animate);
          }}
        >
          {animate ? '\u25A0' : '\u25B6'}
        </Button>
      </span>
      <span>
        {'Level:  '}
        <DropDownList
          values={availableLevels}
          value={verticalLevel}
          setValue={(level: string) => dispatch(updateVerticalLevel(level))}
        />
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableLevels.indexOf(verticalLevel);
            if (currentIndex === 0) {
              return;
            }
            dispatch(updateVerticalLevel(availableLevels[currentIndex - 1]));
          }}
        >
          <Icon name="angle left" />
        </Button>
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableLevels.indexOf(verticalLevel);
            if (currentIndex === availableLevels.length - 1) {
              return;
            }
            dispatch(updateVerticalLevel(availableLevels[currentIndex + 1]));
          }}
        >
          <Icon name="angle right" />
        </Button>
      </span>
    </div>
  );
};

export default LayerSelector;
