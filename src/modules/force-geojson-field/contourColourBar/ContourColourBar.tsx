import React, { useEffect, useState } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';
import {
  selectContours,
  selectColourPalette,
  selectUnits,
} from '../geojsonFieldSlice';
import './ColourBar.css';

const getContrastingColour = (hex: string) => {
  //Remove the hash at the start if it's there
  hex = hex.replace('#', '');

  //Parse the r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  //Calculate the brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  //Return black or white depending on the brightness
  return brightness > 128 ? '#000000' : '#FFFFFF';
};
interface Props {
  level: string;
  lowerHexCode: string;
  upperHexCode: string;
  numKeys: number;
}
const ColourPanel = ({ level, lowerHexCode, upperHexCode, numKeys }: Props) => {
  console.log(level, lowerHexCode, upperHexCode);
  console.log(numKeys);
  const style: React.CSSProperties = {
    width: '50px',
    height: new String(60 / numKeys) + 'vh',
    background: `linear-gradient(to bottom, ${lowerHexCode}, ${upperHexCode})`,
    color: getContrastingColour(lowerHexCode),
    fontFamily: 'Courier New, Monospace',
    zIndex: '12',
    position: 'relative',
    textAlign: 'center',
  };
  return <div style={style}>{parseInt(level.split('_')[1])}</div>;
};

const Units = ({ unit }: { unit: string }) => {
  const style: React.CSSProperties = {
    width: '50px',
    height: '30px',
    background: 'black',
    color: 'white',
    fontFamily: 'Courier New, Monospace',
    zIndex: '12',
    position: 'relative',
    textAlign: 'center',
  };
  return <div style={style}>{unit}</div>;
};

const ContourColourBar = () => {
  const contours = useSelector(selectContours);
  const colourPalette = useSelector(selectColourPalette);
  const units = useSelector(selectUnits);
  const [components, setComponents] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const numContours: number = Object.keys(contours).length;
    const numColours: number = Object.keys(contours).length;
    if (numContours === 0 || numColours === 0 || numColours !== numContours) {
      setComponents([]);
    } else {
      const keys = Object.keys(contours);
      const index = Array.from({ length: keys.length }, (e, i) => i);
      console.log(keys);
      console.log(index);
      const panels = index
        .slice(1)
        .reverse()
        .map((i: number) => {
          return (
            <ColourPanel
              key={keys[i]}
              level={contours[keys[i]]}
              lowerHexCode={colourPalette[keys[i]]}
              upperHexCode={colourPalette[keys[i - 1]]}
              numKeys={keys.length}
            />
          );
        });
      panels.push(
        <ColourPanel
          key={0}
          level={contours[0]}
          lowerHexCode={colourPalette[0]}
          upperHexCode={colourPalette[1]}
          numKeys={keys.length}
        />,
      );
      panels.push(<Units unit={units} />);
      setComponents(panels);
    }
  }, [contours, colourPalette]);

  return <div className="ContourColourBar">{components}</div>;
};

export default ContourColourBar;
