import React, { useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';

import { SemanticICONS } from 'semantic-ui-react';
import {
  updateBaseMapId,
  selectBaseMaps,
  selectBaseMapId,
  updateThemeId,
  selectThemes,
  selectThemeId,
  selectMenuStyle,
} from '../mapping/mapSlice';

import {
  updateColourPaletteId,
  updateOpacity,
  selectColourPalettes,
  selectColourPaletteId,
  selectOpacity,
} from '../modules/force-geojson-field/geojsonFieldSlice';

import DropDownList from './DropDownList';

const TempBaseMapMenu = ({ id, icon }: { id: string; icon: SemanticICONS }) => {
  const dispatch = useDispatch();
  const baseMaps: string[] = useSelector(selectBaseMaps);
  const baseMapId: string = useSelector(selectBaseMapId);
  const themes: string[] = useSelector(selectThemes);
  const themeId: string = useSelector(selectThemeId);
  const colourPalettes: string[] = useSelector(selectColourPalettes);
  const colourPaletteId: string = useSelector(selectColourPaletteId);
  const opacity: number = useSelector(selectOpacity);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };
  return (
    <div style={style}>
      <span>
        {'Base Map:  '}
        <DropDownList
          values={baseMaps}
          value={baseMapId}
          setValue={(baseMap: string) => dispatch(updateBaseMapId(baseMap))}
        />
      </span>
      <span>
        {'Theme:  '}
        <DropDownList
          values={themes}
          value={themeId}
          setValue={(theme: string) => dispatch(updateThemeId(theme))}
        />
      </span>
      <span>
        {'Colour Palette:  '}
        <DropDownList
          values={colourPalettes}
          value={colourPaletteId}
          setValue={(colourPalette: string) =>
            dispatch(updateColourPaletteId(colourPalette))
          }
        />
      </span>
      <input
        type="range"
        id="opacity"
        min="0"
        max="1"
        step="0.1"
        value={opacity}
        onChange={(e) => {
          dispatch(updateOpacity(parseFloat(e.target.value)));
        }}
      ></input>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
      <p>1101</p>
    </div>
  );
};
export default TempBaseMapMenu;
