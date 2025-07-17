
import React, { useEffect } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { updateCrrChosenStyle, updateOpacityCRR, updateOpacityRDT } from "./fastaSlice";

/*
import {
  updateBaseMapId,
  selectBaseMaps,
  selectBaseMapId,
} from '../../mapping/mapSlice';

/*
import {
  updateColourPaletteId,
  updateOpacity,
  selectColourPalettes,
  selectColourPaletteId,
  selectOpacity,
} from '../modules/fasta/geojsonFieldSlice';
*/

const ColourSchemeMenu = (/*{ id }: { id: string }*/) => {
  const dispatch = useDispatch();
  //const baseMaps: string[] = useSelector(selectBaseMaps);
  //const baseMapId: string = useSelector(selectBaseMapId);
  //const colourPalettes: string[] = useSelector(selectColourPalettes);
  //const colourPaletteId: string = useSelector(selectColourPaletteId);
  //const opacity: number = useSelector(selectOpacity);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={style}>
      <div>
        <label htmlFor="style">Style:  </label>
        <select id="style"  >

          <option key="1"
            value="0"
            onClick={(element) =>
              dispatch(updateCrrChosenStyle("rainbow"))}
          > Rainbow </option>
          <option key="1"
            value="1"
            onClick={(element) =>
              dispatch(updateCrrChosenStyle("tol"))}
          > Tol </option>
          <option key="3"
            value="2"
            onClick={(element) =>
              dispatch(updateCrrChosenStyle("viridis"))}
          > Viridis </option>
        </select>
      </div>
      <div>
        <label htmlFor="opacity">CRR Opacity:  </label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          onChange={(element) =>
            dispatch(updateOpacityCRR(parseFloat(element.target.value)))
          }
        />
      </div>
      <div>
        <label htmlFor="opacity">RDT Opacity:  </label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          onChange={(element) =>
            dispatch(updateOpacityRDT(parseFloat(element.target.value)))
          }
        />
      </div>
    </div>
  );
};
export default ColourSchemeMenu;
