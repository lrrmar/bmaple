import React, { useState } from 'react';
import { useAppSelector as useSelector } from '../hooks';
import { selectThemeId } from '../mapping/mapSlice';

interface Props {
  children?: React.ReactElement;
  style?: { [key: string]: string };
  minimise?: string;
}

const FloatingBox = (props: Props) => {
  const theme: string = useSelector(selectThemeId);
  const minimise = props.minimise;
  const [isMinimised, setIsMinimised] = useState(false);
  let right: string | undefined = '10px';
  let bottom: string | undefined = '10px';
  if (!!props.style && !!props.style.left) {
    props.style.flexDirection = 'row';
    right = undefined;
  }
  if (!!props.style && !!props.style.top) {
    bottom = undefined;
  }
  const style: React.CSSProperties = {
    position: 'absolute',
    right: right,
    bottom: bottom,
    //overflow: 'auto',
    padding: '3px',
    display: 'flex',
    flexDirection: 'row-reverse',
    borderRadius: '5px',
    zIndex: 10,
    ...props.style,
  };

  return (
    <div style={style} className={theme}>
      {minimise && (
        <button
          onClick={(e) => {
            setIsMinimised(!isMinimised);
          }}
        >
          {minimise}
        </button>
      )}
      {!isMinimised && props.children}
    </div>
  );
};

export default FloatingBox;
