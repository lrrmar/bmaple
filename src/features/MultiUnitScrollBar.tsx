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
    const newMarks: Mark[] = values.map((val, i) => {
      return { value: i, label: `${val}` }; //`${val}${units}` <- swap back to this eventually
    });
    if (newMarks.length > 0) setMarks(newMarks);
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
    if (lastKey == 'ArrowDown' || lastKey == 'ArrowUp') {
      let index: number = value ? values.indexOf(value) : 0;
      if (index !== null) {
        if (index == -1) index += 1; // HACK
        const newIndex = lastKey == 'ArrowDown' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex == values.length) {
          return;
        } else {
          dispatch(updateValue(values[newIndex]));
        }
      }
    }
  }, [keyPress]);

  useEffect(() => {
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
          '& .MuiSlider-rail': {
            color: '#f1f1f1',
            width: '.15em',
          },
          '& .MuiSlider-thumb': {
            color: '#f1f1f1',
            height: '.2em',
            borderRadius: '10%',
          },
          '& .MuiSlider-mark': {
            color: '#f1f1f1',
            width: '.3em',
            borderRadius: '10%',
          },
          '& .MuiSlider-markLabel': {
            color: '#f0f0f0', // Change label color
          },
        }}
      />,
    );
  }, [marks, value]);

  if (Object.keys(values).length === 0) {
    dispatch(updateValue(''));
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
    dispatch(updateValue(values[0]));
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
