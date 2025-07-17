import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';
import { Selector, Action } from '../App';

const getUTCString = (timeInt: number) => {
  const dt = new Date(timeInt);
  return dt.toUTCString();
};
interface Props {
  displayTimes: number[];
  displayTime: number;
  updateDisplayTime: Action<string>;
}
interface Mark {
  value: number;
  label: string;
}
const ScrollingScale = ({
  displayTimes,
  displayTime,
  updateDisplayTime,
}: Props) => {
  const dispatch = useDispatch();
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    if (displayTimes) {
      const newMarks = displayTimes.map((timeInt) => {
        const dt = new Date(timeInt);
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
            ? `${zf(month)}-${zf(day)}\n${zf(hour)}:${zf(minute)}`
            : `${zf(hour)}:${zf(minute)}`;
        return {
          value: timeInt,
          label: label,
        };
      });
      setMarks(newMarks);
    }
  }, [displayTimes]);

  if (Object.keys(displayTimes).length === 0) {
    return <div></div>;
  }

  return (
    <div style={{ width: '80vw', padding: '0px 35px', color: '#f1f1f1' }}>
      <Slider
        defaultValue={0}
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
            color: '#000000', // Change label color
          },
        }}
      />
    </div>
  );
};

export default ScrollingScale;
