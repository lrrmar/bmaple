import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';
import { selectDisplayTimes, updateDisplayTime } from '../mapping/mapSlice';

const getUTCString = (timeInt: number) => {
  const dt = new Date(timeInt);
  return dt.toUTCString();
};
interface Mark {
  value: number;
  label: string;
}
const ScrollingScale = () => {
  const dispatch = useDispatch();
  const displayTimes = useSelector(selectDisplayTimes);
  const [upperLim, setUpperLim] = useState<number>(0);
  const [lowerLim, setLowerLim] = useState<number>(0);
  const [increment, setIncrement] = useState<number>(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const sources = Object.keys(displayTimes);
  let allTimeInts: number[] = [];
  Object.values(displayTimes).forEach((array) => {
    allTimeInts = [...allTimeInts, ...array];
  });

  useEffect(() => {
    // Get min time and floor it to nearest hour
    const minDateTime = new Date(Math.min(...allTimeInts));
    minDateTime.setMinutes(0);
    minDateTime.setSeconds(0);
    setLowerLim(minDateTime.getTime());

    // Get max time and ceil it to nearest hour
    const maxDateTime = new Date(Math.max(...allTimeInts));
    if (maxDateTime.getMinutes() != 0 || maxDateTime.getSeconds() != 0) {
      maxDateTime.setHours(maxDateTime.getHours() + 1);
    }
    maxDateTime.setMinutes(0);
    maxDateTime.setSeconds(0);
    setUpperLim(maxDateTime.getTime());

    //TODO: set up auto increment based on zoom level of bar
    const oneHourInMs = 60 * 60 * 1000;
    setIncrement(oneHourInMs);
    const tempMarks: Mark[] = [];
    let currentTimeInt = minDateTime.getTime();
    while (currentTimeInt <= maxDateTime.getTime()) {
      const dt = new Date(currentTimeInt);
      const hour = dt.getHours();
      const minute = dt.getMinutes();
      const day = dt.getDate();
      const month = dt.getMonth() + 1;

      const zf = (num: number) => {
        // zero formatter
        return num < 10 ? `0${num}` : `${num}`;
      };
      const label =
        hour === 0
          ? `${zf(month)}-${zf(day)} ${zf(hour)}:${zf(minute)}`
          : `${zf(hour)}:${zf(minute)}`;
      tempMarks.push({
        value: currentTimeInt,
        label: label,
      });
      currentTimeInt += increment;
      setMarks(tempMarks);
    }
  }, [displayTimes]);

  return (
    <div style={{ width: '80vw' }}>
      <Slider
        defaultValue={0}
        min={lowerLim}
        max={upperLim}
        step={increment}
        track={false}
        marks={marks}
        valueLabelDisplay={'auto'}
        valueLabelFormat={getUTCString}
        onChange={(e: Event, value: number | number[]) => {
          if (typeof value === 'number') dispatch(updateDisplayTime(value));
        }}
      />
    </div>
  );
};

export default ScrollingScale;
