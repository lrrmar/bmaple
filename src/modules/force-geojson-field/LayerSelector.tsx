import React, { useEffect, useState, useRef } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import LoadingSpinner from '../../features/LoadingSpinner';
import { updatePositioning, selectPositioning } from '../../mapping/mapSlice';
import { HashTable } from './geojsonFieldHashTables';

import {
  updateSelectedId,
  selectProfileId,
  selectSelectedId,
  selectHashTables,
  selectHashesFlag,
} from './geojsonFieldSlice';

const LayerSelector = () => {
  const dispatch = useDispatch();
  const positioning = useSelector(selectPositioning);
  const geojsonFieldHashesFlag = useSelector(selectHashesFlag);
  const profileId = useSelector(selectProfileId);
  const selectedId = useSelector(selectSelectedId);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableVarnames, setAvailableVarnames] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<number[]>([]);
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableValidTimes, setAvailableValidTimes] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [varname, setVarname] = useState<string>('');
  const [domain, setDomain] = useState<number>(-1);
  const [startTime, setStartTime] = useState<string>('');
  const validTime = positioning.time;
  const verticalLevel = positioning.verticalLevel;
  const variableHashes: HashTable[] = useSelector(selectHashTables);
  const [animate, setAnimate] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [pulseInterval, setPulseInterval] = useState(1000);

  useEffect(() => {
    /* Initial selection / positioning
     *         */
    if (variableHashes.length === 0) {
      return;
    }
    setVarname(variableHashes[0].varname);
    setDomain(variableHashes[0].grid_id);
    setStartTime(variableHashes[0].sim_start_time);
    dispatch(
      updatePositioning({
        time: variableHashes[0].valid_time,
        verticalLevel: variableHashes[0].level_type,
      }),
    );
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
            return hash['grid_id'];
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
      varname: varname,
      sim_start_time: startTime,
      valid_time: validTime,
      level_type: verticalLevel,
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
  }, [varname, startTime, validTime, verticalLevel, domain]);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
  };

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
      dispatch(
        updatePositioning({
          ...positioning,
          time: availableValidTimes[currentIndex + 1],
        }),
      );
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
      <select
        id="varname"
        value={varname}
        onChange={(e) => {
          setVarname(e.target.value);
        }}
      >
        {[...availableVarnames].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <label htmlFor="Domain">Domain:</label>
      <select
        id="domain"
        value={domain}
        onChange={(e) => {
          setDomain(parseInt(e.target.value));
        }}
      >
        {[...availableDomains].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const currentIndex = availableDomains.indexOf(domain);
          if (currentIndex === 0) {
            return;
          }
          setDomain(availableDomains[currentIndex - 1]);
        }}
      >
        -
      </button>
      <button
        onClick={() => {
          const currentIndex = availableDomains.indexOf(domain);
          if (currentIndex === availableDomains.length - 1) {
            return;
          }
          setDomain(availableDomains[currentIndex + 1]);
        }}
      >
        +
      </button>
      <label htmlFor="startTime">Start time:</label>
      <select
        id="startTime"
        value={startTime}
        onChange={(e) => {
          setStartTime(e.target.value);
        }}
      >
        {[...availableStartTimes].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <label htmlFor="validTime">Valid time:</label>
      <select
        id="validTime"
        value={validTime}
        onChange={(e) => {
          dispatch(updatePositioning({ ...positioning, time: e.target.value }));
        }}
      >
        {[...availableValidTimes].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const currentIndex = availableValidTimes.indexOf(validTime);
          if (currentIndex === 0) {
            return;
          }
          dispatch(
            updatePositioning({
              ...positioning,
              time: availableValidTimes[currentIndex - 1],
            }),
          );
        }}
      >
        -
      </button>
      <button
        onClick={() => {
          const currentIndex = availableValidTimes.indexOf(validTime);
          if (currentIndex === availableValidTimes.length - 1) {
            return;
          }
          dispatch(
            updatePositioning({
              ...positioning,
              time: availableValidTimes[currentIndex + 1],
            }),
          );
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          setAnimate(!animate);
        }}
      >
        {animate ? '\u25A0' : '\u25B6'}
      </button>
      <label htmlFor="Vertical Level">Level:</label>
      <select
        id="verticalLevel"
        value={verticalLevel}
        onChange={(e) => {
          dispatch(
            updatePositioning({
              ...positioning,
              verticalLevel: e.target.value,
            }),
          );
        }}
      >
        {[...availableLevels].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const currentIndex = availableLevels.indexOf(verticalLevel);
          if (currentIndex === 0) {
            return;
          }
          dispatch(
            updatePositioning({
              ...positioning,
              verticalLevel: availableLevels[currentIndex - 1],
            }),
          );
        }}
      >
        -
      </button>
      <button
        onClick={() => {
          const currentIndex = availableLevels.indexOf(verticalLevel);
          if (currentIndex === availableLevels.length - 1) {
            return;
          }
          dispatch(
            updatePositioning({
              ...positioning,
              verticalLevel: availableLevels[currentIndex + 1],
            }),
          );
        }}
      >
        +
      </button>
    </div>
  );
};

export default LayerSelector;
