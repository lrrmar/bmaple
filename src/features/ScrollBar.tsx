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
} from '../mapping/mapSlice';
import { Selector, ActionCreator } from '../App';

interface Mark {
  value: number;
  label: string;
}

interface Props<T, U, V> {
  selectValues: Selector<number[]>;
  selectUnits: Selector<string | null>;
  updateValue: ActionCreator<number>;
  orientation: 'horizontal' | 'vertical';
}

const ScrollingScale = <T, U>({
  selectValues,
  selectUnits,
  updateValue,
  orientation,
}: Props<number[], number | null, string | null>) => {
  const dispatch = useDispatch();
  const values: number[] = useSelector(selectValues);
  const units: string | null = useSelector(selectUnits);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [content, setContent] = useState<React.ReactNode>([]);

  useEffect(() => {
    const newMarks: Mark[] = values.map((val) => {
      return { value: val, label: `${val} ${units}` }; //`${val}${units}` <- swap back to this eventually
    });
    setMarks(newMarks);
  }, [values, units]);

  useEffect(() => {
    setContent(
      <Slider
        step={null}
        defaultValue={0}
        min={Math.min(...values)}
        max={Math.max(...values)}
        marks={marks}
        valueLabelDisplay={'auto'}
        valueLabelFormat={(label) => label}
        orientation={orientation}
        onChange={(e: Event, value: number | number[]) => {
          if (typeof value === 'number') dispatch(updateValue(value));
        }}
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
        }}
      />,
    );
  }, [marks]);

  if (Object.keys(values).length === 0) {
    return <div></div>;
  }

  if (Object.keys(values).length === 1) {
    return <div>{units}</div>;
  }

  const style: { [key: string]: string } = {
    padding: '0px 40px',
    color: '#f1f1f1',
  };
  if (orientation === 'vertical') {
    style['height'] = '50vh';
    style['padding'] = '8px 15px';
  } else {
    style['width'] = '80vw';
  }
  return <div style={style}>{content}</div>;
};

export default ScrollingScale;
