import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';
import {
  selectVerticalLevel, // TEMP
  selectDisplayTime,
  selectDisplayTimes,
  updateDisplayTime,
} from '../mapping/mapSlice';
import { Selector, Action } from '../App';

interface Mark {
  value: number;
  label: string;
}

interface Props<T, U> {
  selectValues: Selector<string[]>;
  updateValue: Action<string>;
  orientation: 'horizontal' | 'vertical';
}

/* Similar to scroll bar but just takes a list of strings rather than
 * getting into any numerics.
 */

const MultiUnitScrollBar = <T, U>({
  selectValues,
  updateValue,
  orientation,
}: Props<string[], string | null>) => {
  const dispatch = useDispatch();
  const values: string[] = useSelector(selectValues);
  const verticalLevel = useSelector(selectVerticalLevel);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [content, setContent] = useState<React.ReactNode>([]);

  useEffect(() => {
    const newMarks: Mark[] = values.map((val, i) => {
      return { value: i, label: `${val}` }; //`${val}${units}` <- swap back to this eventually
    });
    if (newMarks.length > 0)
      //dispatch(updateValue(newMarks[0].value));
      setMarks(newMarks);
  }, [values, verticalLevel]);

  useEffect(() => {
    setContent(
      <Slider
        defaultValue={0}
        marks={marks}
        min={0}
        max={values.length - 1}
        //valueLabelDisplay={'on'}
        //valueLabelFormat={(i) => values[i]}
        orientation={orientation}
        onChange={(e: Event, value: number | number[]) => {
          if (typeof value === 'number') dispatch(updateValue(values[value]));
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
    dispatch(updateValue(''));
    return <div></div>;
  }
  const style: { [key: string]: string } = {
    padding: '0px 40px',
    color: '#f1f1f1',
  };

  if (Object.keys(values).length === 1) {
    dispatch(updateValue(values[0]));
    return <div style={style}>{values[0]}</div>;
  }

  if (orientation === 'vertical') {
    style['height'] = '50vh';
    style['padding'] = '8px 15px';
  } else {
    style['width'] = '80vw';
  }
  return <div style={style}>{content}</div>;
};

export default MultiUnitScrollBar;
