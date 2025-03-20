import React, { useEffect, useState, useRef } from 'react';
import { Button, ButtonGroup, Icon, Dropdown } from 'semantic-ui-react';
import DropDownList from '../../features/DropDownList';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import LoadingSpinner from '../../features/LoadingSpinner';
import { updateDisplayTime, selectDisplayTime } from '../../mapping/mapSlice';
import { HashTable } from './geojsonFieldHashTables';

import {
  updateSelectedId,
  selectProfileId,
  selectSelectedId,
  selectHashTables,
  selectHashesFlag,
  selectApiUrl,
  updateVarname,
  selectVarname,
  updateStartTime,
  selectStartTime,
  updateDomain,
  selectDomain,
  updateVerticalLevel,
  selectVerticalLevel,
  selectVerticalLevels,
} from './geojsonFieldSlice';

const isString = (x: any) => !!x && typeof x === 'string';

const LayerSelector = () => {
  const dispatch = useDispatch();
  const validTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const verticalLevels: number[] = useSelector(selectVerticalLevels);
  const varname = useSelector(selectVarname);
  const startTime = useSelector(selectStartTime);
  const domain = useSelector(selectDomain);
  const geojsonFieldHashesFlag = useSelector(selectHashesFlag);
  const profileId = useSelector(selectProfileId);
  const selectedId = useSelector(selectSelectedId);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableVarnames, setAvailableVarnames] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableValidTimes, setAvailableValidTimes] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
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
    if (varname === '') dispatch(updateVarname(variableHashes[0].varname));
    if (domain === '')
      dispatch(updateDomain(variableHashes[0].grid_id.toString()));
    if (startTime === '')
      dispatch(updateStartTime(variableHashes[0].sim_start_time));
    if (validTime === '')
      dispatch(
        updateDisplayTime(new Date(variableHashes[0].valid_time).getTime()),
      );
    if (verticalLevel === null)
      if (verticalLevels) dispatch(updateVerticalLevel(verticalLevels[0]));
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
    const level = verticalLevel === 0 ? 'Single' : `P${verticalLevel}`;
    const layerMetaData = {
      varname: varname,
      sim_start_time: startTime,
      valid_time: validTime,
      level_type: level,
      grid_id: domain,
    };
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
  }, [variableHashes, varname, startTime, validTime, verticalLevel, domain]);

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
      // dispatch(updateDisplayTime(availableValidTimes[currentIndex + 1]));
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
        value={varname}
        setValue={(v: string) => dispatch(updateVarname(v))}
      />
      <span>
        Domain:
        <DropDownList
          values={availableDomains}
          value={domain}
          setValue={(d: string) => dispatch(updateDomain(d))}
        />
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableDomains.indexOf(domain);
            if (currentIndex === 0) {
              return;
            }
            dispatch(updateDomain(availableDomains[currentIndex - 1]));
          }}
        >
          <Icon name="angle left" />
        </Button>
        <Button
          icon
          size="mini"
          onClick={() => {
            const currentIndex = availableDomains.indexOf(domain);
            if (currentIndex === availableDomains.length - 1) {
              return;
            }
            dispatch(updateDomain(availableDomains[currentIndex + 1]));
          }}
        >
          <Icon name="angle right" />
        </Button>
      </span>
      <span>
        <label htmlFor="startTime">Start time:</label>
        <DropDownList
          values={availableStartTimes}
          value={startTime}
          setValue={(s: string) => dispatch(updateStartTime(s))}
        />
      </span>
      {/*
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
        */}
    </div>
  );
};

export default LayerSelector;
