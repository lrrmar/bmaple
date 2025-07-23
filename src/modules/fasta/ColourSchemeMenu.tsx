
import React, { useEffect } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { updateCrrChosenStyle, updateOpacityCRR, updateOpacityRDT } from "./fastaSlice";

import { updateCountry, updateSeverity, updateOpacity, updateStyle } from './fastaCAP/capSlice'

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
      <h3> Weather Filters: </h3>
      <div>
        <label htmlFor="style">Style: </label>
        <select
          id="style"
          onChange={(event) => dispatch(updateCrrChosenStyle(event.target.value))}
        >
          <option value="rainbow">Rainbow</option>
          <option value="tol">Tol</option>
          <option value="viridis">Viridis</option>
        </select>
      </div>
      <div>
        <label htmlFor="opacityCRR">CRR Opacity:  </label>
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
        <label htmlFor="opacityRDT">RDT Opacity:  </label>
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
      <h3> CAP Filters </h3>
      <div>
        <label htmlFor="style">Style: </label>
        <select
          id="style"
          onChange={(event) => dispatch(updateStyle(event.target.value))}
        >
          <option value = "default"> Default</option>
          <option value="rainbow">Rainbow</option>
          <option value="tol">Tol</option>
          <option value="viridis">Viridis</option>
        </select>
      </div>
      <div>
        <label htmlFor="opacityCAP">CAP Opacity:  </label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          defaultValue="0.5"
          onChange={(element) =>
            dispatch(updateOpacity(parseFloat(element.target.value)))
          }
        />
      </div>
      <div>
        <label htmlFor="country">Cap Country </label>
        <select
          id="country"
          onChange={(event) => dispatch(updateCountry(event.target.value))}
        >
          <option value="All">All</option>
          <option value="ML">ML</option>
          <option value="TZ">TZ</option>
          <option value="GN">GN</option>
        </select>
      </div>
      <div>
        <label htmlFor="Severity">Cap Severity </label>
        <select
          id="Severity"
          onChange={(event) => dispatch(updateSeverity(event.target.value))}
        >
          <option value="All">All</option>
          <option value="Minor">Minor</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
          <option value="Extreme">Extreme</option>
        </select>
      </div>





    </div>
  );
};
export default ColourSchemeMenu;
