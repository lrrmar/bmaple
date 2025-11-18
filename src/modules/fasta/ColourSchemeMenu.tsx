import React, { useEffect } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import {
  updateCrrChosenStyle,
  updateOpacityCRR,
  updateOpacityRDT,
  updateOpacityLightning,
} from './fastaSlice';

import {
  updateCountry,
  updateSeverity,
  updateOpacity,
  updateStyle,
  updateDesiredTime,
} from './fastaCAP/capSlice';

import {
  updateBaseMapId,
  selectBaseMaps,
  selectBaseMapId,
} from '../../mapping/mapSlice';

import DropDownList from '../../features/DropDownList';

import { selectCountryList } from './fastaCAP/capSlice';

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

interface Props {
  name: string;
  id: string;
}

const ColourSchemeMenu = ({ name, id }: Props) => {
  const dispatch = useDispatch();
  const baseMaps: string[] = useSelector(selectBaseMaps);
  const baseMapId: string = useSelector(selectBaseMapId);
  //const colourPalettes: string[] = useSelector(selectColourPalettes);
  //const colourPaletteId: string = useSelector(selectColourPaletteId);
  //const opacity: number = useSelector(selectOpacity);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: 'black',
    paddingLeft: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
  };

  const subHeading: React.CSSProperties = {
    margin: '5px 0px',
  };

  const optionStyle: React.CSSProperties = {
    color: 'black',
    display: 'flex',
    flexDirection: 'row',
    fontSize: '10px',
    justifyContent: 'space-between',
  };

  const timescrollBarStyle: React.CSSProperties = {
    color: 'black',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  };

  const countryList = useSelector(selectCountryList);

  return (
    <div style={style}>
      <h4 style={subHeading}>Weather Filters:</h4>
      <div>
        <label htmlFor="opacityCRR">CRR Opacity: </label>
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
        <label htmlFor="opacityRDT">RDT Opacity: </label>
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
      <div>
        <label htmlFor="opacityLightning">Lightning Opacity: </label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          onChange={(element) =>
            dispatch(updateOpacityLightning(parseFloat(element.target.value)))
          }
        />
      </div>
      <br />
      <div>
        <label htmlFor="crrStyle">CRR Style: </label>
        <select
          id="crrStyle"
          onChange={(event) =>
            dispatch(updateCrrChosenStyle(event.target.value))
          }
        >
          <option value="rainbow">Rainbow</option>
          <option value="tol">Tol</option>
          <option value="viridis">Viridis</option>
        </select>
      </div>
      <div>
        <label htmlFor="baseMap">Base Map: </label>
        <select
          id="baseMap"
          onChange={(event) => dispatch(updateBaseMapId(event.target.value))}
        >
          <option value="OSM">OSM</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <br />

      <h4 style={subHeading}>CAP Filters</h4>
      <div>
        <label htmlFor="opacityCAP">CAP Opacity: </label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          defaultValue="0"
          onChange={(element) =>
            dispatch(updateOpacity(parseFloat(element.target.value)))
          }
        />
      </div>
      <div>
        <label htmlFor="miniCapTime">CAP Timescroll Bar:</label>
        <input
          type="range"
          id="miniCapTime"
          min="0"
          max="1"
          step="0.25"
          defaultValue="0.5"
          list="optionList"
          style={timescrollBarStyle}
          onChange={(element) =>
            dispatch(updateDesiredTime(parseFloat(element.target.value)))
          }
        />
        <datalist style={optionStyle} id="optionList">
          <option value="0" label="-24hrs"></option>
          <option value="0.25" label="-2hrs"></option>
          <option value="0.5" label="now"></option>
          <option value="0.75" label="+2hrs"></option>
          <option value="1" label="+24hrs"></option>
        </datalist>
      </div>
      <br />
      <div>
        <label htmlFor="country">CAP Country: </label>
        <select
          name="country"
          onChange={(event) => dispatch(updateCountry(event.target.value))}
        >
          <option value="All">All</option>
          {countryList.map((country, i) => {
            return (
              <option
                key={i}
                value={country}
                onChange={(event) => dispatch(updateCountry(country))}
              >
                {country}
              </option>
            );
          })}
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
