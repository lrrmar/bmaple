import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';
import {
  selectDisplayTime,
  selectDisplayTimes,
  updateDisplayTime,
  updateDisplayTimes,
} from '../mapping/mapSlice';

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
  const displayTime = useSelector(selectDisplayTime);
  const displayTimes = useSelector(selectDisplayTimes);
  const [upperLim, setUpperLim] = useState<number>(0);
  const [lowerLim, setLowerLim] = useState<number>(1);
  const [dataIncrement, setDataIncrement] = useState<number>(15 * 60 * 1000);
  const [tickIncrement, setTickIncrement] = useState<number>(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  // TODO: update based on size allocated to slider...
  const [optimalTickCount, setOptimalTickCount] = useState<number>(10);

  const sources = Object.keys(displayTimes);
  let allTimeInts: number[] = [];
  Object.values(displayTimes).forEach((array) => {
    allTimeInts = [...allTimeInts, ...array];
  });

  useEffect(() => {
    // On render, set automatic display times
    const now = new Date(Date.now());
    const minDate = new Date();
    minDate.setFullYear(now.getFullYear());
    minDate.setMonth(now.getMonth());
    minDate.setDate(now.getDate());
    minDate.setUTCHours(6);
    minDate.setMinutes(0);
    minDate.setSeconds(0);
    minDate.setMilliseconds(0);
    const maxDate = new Date(minDate);
    maxDate.setUTCHours(18);
    console.log(minDate, maxDate);
    const dateArray = [minDate];
    while (dateArray[dateArray.length - 1].getTime() < maxDate.getTime()) {
      const newDate = new Date(
        dateArray[dateArray.length - 1].getTime() + 15 * 60000,
      );
      dateArray.push(newDate);
    }
    const times = dateArray.map((date) => date.getTime());
    dispatch(updateDisplayTimes({ source: 'timescroll', times: times }));
  }, []);

  useEffect(() => {
    // Get min time and floor it to nearest hour
    const minDateTime = new Date(Math.min(...allTimeInts));
    minDateTime.setMinutes(0);
    minDateTime.setSeconds(0);
    setLowerLim(minDateTime.getTime());

    // Get max time and ceil it to nearest hour
    const maxDateTime = new Date(Math.max(...allTimeInts));
    if (maxDateTime.getMinutes() != 0 || maxDateTime.getSeconds() != 0) {
      maxDateTime.setUTCHours(maxDateTime.getUTCHours() + 1);
    }
    maxDateTime.setMinutes(0);
    maxDateTime.setSeconds(0);
    setUpperLim(maxDateTime.getTime());
  }, [displayTimes]);

  useEffect(() => {
    // Find increment based on different between lower and upper
    // lims of scroll bar

    const minDateTime = new Date(lowerLim);
    const maxDateTime = new Date(upperLim);
    const oneMinuteInMs = 60 * 1000;
    const oneHourInMs = 60 * oneMinuteInMs;
    const numHours =
      (maxDateTime.getTime() - minDateTime.getTime()) / oneHourInMs;
    let increments: number[] = [];
    let spread = numHours;

    if (
      0.8 * optimalTickCount < numHours &&
      numHours < 1.2 * optimalTickCount
    ) {
      // Less than hour increments
      spread = numHours * 60; // now in minutes
      for (let i = 1; i < 7; i++) {
        if (60 % i === 0) increments.push(60 / i);
      }
      // increments rescaled to hours following modulo
      // ops in tickCountOptions
    } else {
      // Greater than or equal to hour increments
      for (let i = 1; i < numHours + 1; i++) {
        if (24 % i === 0 || i % 24 == 0) increments.push(i);
      }
    }
    const tickCountOptions = increments.map(
      (inc: number) => (spread - (spread % inc)) / inc,
    );
    if (spread !== numHours) {
      increments = increments.map((inc) => inc / 60);
    }

    // OPTIMAL TIK COUNT....
    const tickCountCosts = tickCountOptions.map(
      (count) => (count - optimalTickCount) ** 2,
    );
    const tickCountMin = Math.min(...tickCountCosts);
    const tickCountIndex = tickCountCosts.indexOf(tickCountMin);

    const increment = increments[tickCountIndex] * oneHourInMs;
    const tempMarks: Mark[] = [];
    let currentTimeInt = minDateTime.getTime();
    while (currentTimeInt <= maxDateTime.getTime()) {
      const dt = new Date(currentTimeInt);
      const hour = dt.getUTCHours();
      const minute = dt.getMinutes();
      const day = dt.getDate();
      const month = dt.getMonth() + 1;
      const zf = (num: number) => {
        // zero formatter
        return num < 10 ? `0${num}` : `${num}`;
      };
      const label =
        hour === 0
          ? `${zf(month)}-${zf(day)}\n${zf(hour)}:${zf(minute)}`
          : `${zf(hour)}:${zf(minute)}`;
      tempMarks.push({
        value: currentTimeInt,
        label: label,
      });
      currentTimeInt += increment;
      setMarks(tempMarks);
    }
  }, [lowerLim, upperLim]);

  if (Object.keys(displayTimes).length === 0) {
    return <div></div>;
  }

  return (
    <div style={{ width: '80vw', padding: '0px 35px', color: '#f1f1f1' }}>
      <Slider
        defaultValue={0}
        min={lowerLim}
        max={upperLim}
        step={dataIncrement}
        track={false}
        marks={marks}
        value={new Date(displayTime).getTime()}
        valueLabelDisplay={'auto'}
        valueLabelFormat={getUTCString}
        onChange={(e: Event, value: number | number[]) => {
          if (typeof value === 'number') dispatch(updateDisplayTime(value));
        }}
        color={'info'}
        sx={{
          '& .MuiSlider-rail': {
            //  color: '#f1f1f1', // Change mark color
          },
          '& .MuiSlider-thumb': {
            //color: '#f1f1f1', // Change mark color
          },
          '& .MuiSlider-mark': {
            //backgroundColor: '#a1a1a1', // Change mark color
            //height: 4,
            //width: 3,
            //borderRadius: '50%',
          },
          '& .MuiSlider-markLabel': {
            color: '#f1f1f1', // Change label color
          },
          '& .MuiSlider-text': {
            color: '#f1f1f1', // Change label color
          },
        }}
      />
    </div>
  );
};

export default ScrollingScale;
