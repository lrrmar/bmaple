
import React, { useEffect } from 'react';
/*
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '.
./hooks';
*/
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

const ColourSchemeMenu = ({ id }: { id: string }) => {
  //const dispatch = useDispatch();
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
      <label htmlFor="colourScheme">Colour Scheme:</label>
      <select
        id="colourScheme"
        //value={baseMapId}
        //onChange={(e) => {
        //  dispatch(updateBaseMapId(e.target.value));
        //}}
      >
        <option key="1" value="Rainbow"></option>
        
        {
        //[...baseMaps].map((val) => (
        //  <option key={val} value={val}>
        //    {val}
        //  </option>
        //))
        }
        
      </select>
      <label htmlFor="colourPalette">Colour Palette:</label>
      <select
        id="colourPalette"
        //value={colourPaletteId}
        //onChange={(e) => {
        //  dispatch(updateColourPaletteId(e.target.value));
        //}}
      >
        {
        //[...colourPalettes].map((val) => (
        //  <option key={val} value={val}>
        //    {val}
        //  </option>
        //))
        }
      </select>
      <label htmlFor="opacity">Opacity:</label>
      <input
        type="range"
        id="opacity"
        min="0"
        max="1"
        step="0.1"
        //value={opacity}
        //onChange={(e) => {
        //  dispatch(updateOpacity(parseFloat(e.target.value)));
        //}
        //}
      ></input>
    </div>
  );
};
export default ColourSchemeMenu;
