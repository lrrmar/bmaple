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

const getTextWidth = (text: string, font = '12px Arial') => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font; // Set the font style
    const metrics = context.measureText(text);
    return metrics.width; // Returns the width of the text in pixels
  } else {
    return null;
  }
};

interface Props {
  level: string;
  lowerHexCode: string;
  upperHexCode: string;
  numKeys: number;
}
const ColourPanel = ({ level, lowerHexCode, upperHexCode, numKeys }: Props) => {
  const style: React.CSSProperties = {
    width: new String(60 / numKeys) + 'vw',
    height: '5vh',
    background: `linear-gradient(to right, ${lowerHexCode}, ${upperHexCode})`,
    color: getContrastingColour(lowerHexCode),
    zIndex: '12',
    position: 'relative',
    textAlign: 'center',
    padding: '0px',
  };
  console.log(level);
  console.log(level.split('_'));
  return <div style={style}>{level.split('_')[1]}</div>;
};

const Units = ({ unit }: { unit: string }) => {
  const style: React.CSSProperties = {
    width: '50px',
    height: '5vh',
    color: 'white',
    zIndex: '12',
    position: 'relative',
    textAlign: 'center',
  };
  return (
    <div className="glassTablet" style={style}>
      {unit}
    </div>
  );
};

const ContourColourBar = () => {
  const contours = useSelector(selectContours);
  const colourPalette = useSelector(selectColourPalette);
  const units = useSelector(selectUnits);
  const [components, setComponents] = useState<React.ReactNode[]>([]);
  const [linearGradientString, setLinearGradientString] = useState<string>('');

  useEffect(() => {
    const numContours: number = Object.keys(contours).length;
    const numColours: number = Object.keys(colourPalette).length;
    if (numContours === 0 || numColours === 0 || numColours !== numContours) {
      setComponents([]);
    } else {
      const keys = Object.keys(contours);
      const index = Array.from({ length: keys.length }, (e, i) => i);
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

  useEffect(() => {
    const numContours: number = Object.keys(contours).length;
    const numColours: number = Object.keys(colourPalette).length;
    if (numContours === 0 || numColours === 0 || numColours !== numContours) {
      setComponents([]);
    } else {
      const contourStrings: string[] = Object.values(contours);
      const contourLimits: Set<string> = new Set();
      contourStrings.forEach((contour) =>
        contour.split('_').forEach((part) => contourLimits.add(part)),
      );
      const contourLimitWidths: number[] = [...contourLimits]
        .map((limit) => getTextWidth(limit, '12px Nunito'))
        .map((width) => (width ? width : 0));
      const maxStringWidth: number = contourLimitWidths.reduce((a, b) =>
        Math.max(a, b),
      );
      const totalStringWidth: number = contourLimitWidths.reduce(
        (a, b) => a + b,
      );

      const meanStringWidth: number = totalStringWidth / (numContours + 1);
      const vh: number = window.innerHeight;
      const vw: number = window.innerWidth;
      const fontsize = meanStringWidth;
      const fontWidth = fontsize;
      const barLengthDec = 0.6;
      const colourPanelWidthPerc: number =
        (100 * (0.6 * vw - (numContours + 1) * fontWidth)) /
        (0.6 * vw * numContours);
      const fontWidthPerc = (100 * fontWidth) / (0.6 * vw);
      let linearGradientString = 'linear-gradient(to left, ';
      Object.values(colourPalette).forEach((colour, i) => {
        const basePerc =
          i * (fontWidthPerc + colourPanelWidthPerc) + fontWidthPerc;
        linearGradientString += `${colour} ${basePerc}% ${basePerc + fontWidthPerc}%, `;
      });
      linearGradientString = linearGradientString.slice(0, -2) + ')';
      setLinearGradientString(linearGradientString);
      console.log(contourLimits);

      const divs: React.ReactNode[] = [];
      [...contourLimits].forEach((lim, ind) => {
        console.log(lim);
        const panelColour: string | null = colourPalette[ind.toString()];
        const fontColour: string = panelColour
          ? getContrastingColour(panelColour)
          : getContrastingColour(colourPalette[(ind - 1).toString()]);
        const div: React.ReactNode = (
          <div
            style={{
              width: 'auto',
              display: 'flex',
              flexDirection: 'row-reverse',
            }}
          >
            <div
              style={{
                width: (0.6 * fontWidthPerc).toString() + 'vw',
                color: fontColour,
                textAlign: 'center',
                overflow: 'allow',
              }}
            >
              {lim}
            </div>
            {ind < numContours && (
              <div
                style={{
                  width: (0.6 * colourPanelWidthPerc).toString() + 'vw',
                }}
              >
                {''}
              </div>
            )}
          </div>
        );
        divs.push(div);
        setComponents(divs);
      });
    }
  }, [contours, colourPalette]);

  return (
    <div
      className="ColourBar"
      style={{
        width: '60vw',
        height: '20px',
        background: linearGradientString,
        display: 'flex',
        flexDirection: 'row-reverse',
      }}
    >
      {components}
    </div>
  );
};

export default ContourColourBar;
