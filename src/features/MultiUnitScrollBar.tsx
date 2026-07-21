import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import { Icon } from 'semantic-ui-react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';
import { Selector, Action } from '../App';

interface Mark {
  value: number;
  label: string;
}

interface Props<T, U> {
  selectValue: Selector<string | null>;
  selectValues: Selector<string[]>;
  updateValue: Action<string>;
  orientation: 'horizontal' | 'vertical';
}

/* Similar to scroll bar but just takes a list of strings rather than
 * getting into any numerics.
 */

const handleTimeMarks = (timeStrings: string[]) => {

  const optimalTickCount = 10;
  const times = timeStrings.map((s) => new Date(s));

  // Check that all items in timeStrings array can be converted to
  // a Date
  let badFormat: boolean = false;
  times.forEach((time)  => {
    if (isNaN(time.getTime())) badFormat = true;
  })

  if (timeStrings.length < 1) return null;
  if (badFormat) return null;

  const timeInts = timeStrings.map((s) => (new Date(s)).getTime());

  // Get minimum time spacing between each time 
  //
  const zeroedTimeInts = timeInts.map((time) => time - timeInts[0]);
  // 1. Define the Euclidean algorithm for two numbers
  const getGCDTwo = (a: number, b: number): number => (!b ? a : getGCDTwo(b, a % b));

  // 2. Extend it to an entire set (array) of numbers
  const getGCDSet = (numbers: number[]): number => numbers.reduce((a, b) => getGCDTwo(a, b));

  const minDataIncrement = getGCDSet(zeroedTimeInts);


  // Get min time and floor it to nearest hour
  const minDateTime = new Date(Math.min(...timeInts));
  minDateTime.setMinutes(0);
  minDateTime.setSeconds(0);
  // Get max time and ceil it to nearest hour
  const maxDateTime = new Date(Math.max(...timeInts));
  if (maxDateTime.getMinutes() != 0 || maxDateTime.getSeconds() != 0) {
    maxDateTime.setHours(maxDateTime.getHours() + 1);
  }
  maxDateTime.setMinutes(0);
  maxDateTime.setSeconds(0);

  // Find increment based on different between lower and upper
  // lims of scroll bar

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

  const markIncrement = increments[tickCountIndex] * oneHourInMs;
  const tempMarks: Mark[] = [];
  let currentTimeInt = minDateTime.getTime();
  let valueInt = 0;
  const dataToMarkIncrement = Math.floor(markIncrement / minDataIncrement);
  while (currentTimeInt <= maxDateTime.getTime()) {
    const dt = new Date(
      currentTimeInt + new Date().getTimezoneOffset() * 60 * 1000,
    );
    const hour = dt.getHours();
    const minute = dt.getMinutes();
    const day = dt.getDate();
    const month = dt.getMonth() + 1;

    const zf = (num: number) => {
      // zero formatter
      return num < 10 ? `0${num}` : `${num}`;
    };
    const label =
      hour === 0 || currentTimeInt === minDateTime.getTime()
        ? `${zf(month)}-${zf(day)}\n${zf(hour)}:${zf(minute)}`
        : `${zf(hour)}:${zf(minute)}`;
    tempMarks.push({
      value: valueInt,
      label: label,
    });
    currentTimeInt += markIncrement;
    valueInt += dataToMarkIncrement;
  }
  return tempMarks
}

const MultiUnitScrollBar = <T, U>({
  selectValue,
  selectValues,
  updateValue,
  orientation,
}: Props<string[], string | null>) => {
  const dispatch = useDispatch();
  const value: string | null = useSelector(selectValue);
  const values: string[] = useSelector(selectValues);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [content, setContent] = useState<React.ReactNode>([]);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [keyPress, setKeyPress] = useState<number>(0);

  useEffect(() => {
    const timeMarks = handleTimeMarks(values);
    let newMarks: Mark[];
    if (timeMarks !== null) {
      newMarks = timeMarks;
    } else {
      newMarks = values.map((val, i) => {
        return { value: i, label: `${val}` }; //`${val}${units}` <- swap back to this eventually
      });
    }
    if (newMarks.length > 0) {
      setMarks(newMarks);
    }
  }, [values, value]);

  const keyDown = (key: string) => {
    const throttle = 200; //ms
    if (Date.now() - keyPress > throttle) {
      setLastKey(key);
      setKeyPress(Date.now());
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keyDown(event.key);
    };

    // Add global keydown listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handling key strokes
  useEffect(() => {
    let decrease: string;
    let increase: string;
    if (orientation == 'vertical') {
      decrease = 'ArrowDown';
      increase = 'ArrowUp';
    } else {
      decrease = 'ArrowLeft';
      increase = 'ArrowRight';
    }
    if (lastKey == decrease || lastKey == increase) {
      let index: number = value ? values.indexOf(value) : 0;
      if (index !== null) {
        if (index == -1) index += 1; // HACK
        const newIndex = lastKey == decrease ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex == values.length) {
          return;
        } else {
          dispatch(updateValue(values[newIndex]));
        }
      }
    }
  }, [keyPress]);

  useEffect(() => {
    const muiSliderRail: Record<string, string> = {
      color: '#f1f1f1',
    };

    const muiSliderThumb: Record<string, string> ={
      color: '#f1f1f1',
      borderRadius: '10%',
    }

    const muiSliderMark: Record<string, string> ={
      color: '#f1f1f1',
      borderRadius: '10%',
    }
    if (orientation == 'vertical') {
        muiSliderRail['width'] = '.15em';
        muiSliderThumb['height'] = '.2em';
        muiSliderMark['width'] = '.3em';
    } else {
        muiSliderRail['height'] = '.15em';
        muiSliderThumb['width'] = '.2em';
        muiSliderMark['height'] = '.3em';
    }
    setContent(
      <Slider
        defaultValue={0}
        marks={marks}
        min={0}
        max={values.length - 1}
        step={1}
        track={false}
        value={value ? values.indexOf(value) : 0}
        orientation={orientation}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        sx={{
          '& .MuiSlider-rail': muiSliderRail,
          '& .MuiSlider-thumb': muiSliderThumb,
          '& .MuiSlider-mark': muiSliderMark,
          '& .MuiSlider-markLabel': {
            color: '#f0f0f0', // Change label color
          },
        }}
      />,
    );
  }, [marks, value]);

  if (Object.keys(values).length === 0) {
    return <div></div>;
  }
  const style: { [key: string]: string } = {
    padding: '10px 40px',
    color: '#f1f1f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  if (Object.keys(values).length === 1) {
    return <div style={style}>{values[0]}</div>;
  }

  if (orientation === 'vertical') {
    style['height'] = '50vh';
    style['padding'] = '8px 15px';
    style['flexDirection'] = 'column';
  } else {
    style['width'] = '80vw';
    style['flexDirection'] = 'vertical';
  }
  return (
    <div style={style}>
      {content}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '15px 0px 0px',
        }}
      >
        <Icon
          name={'angle up'}
          size="large"
          onClick={() => keyDown('ArrowUp')}
        />
        <Icon
          name={'angle down'}
          size="large"
          onClick={() => keyDown('ArrowDown')}
        />
      </div>
    </div>
  );
};

export default MultiUnitScrollBar;
