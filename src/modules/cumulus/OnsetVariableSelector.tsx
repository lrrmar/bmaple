import React, { useState } from 'react';
import MapLegend, { MapLegendProps } from './MapLegend';
import PrecipitationLegendData from './PrecipitationLegendData';
import {
  selectSelectedOnsetVariable,
  updateSelectedOnsetVariable,
} from './cumulusSlice';
import { useDispatch } from 'react-redux';

const OnsetVariableSelector = () => {
  const dispatch = useDispatch();

  const [selectedLayer, setSelectedLayer] = useState(0); // 0 = Day of Year, 1 = Rain Days Ago

  const handleLayerChange = (index: number) => {
    setSelectedLayer(index);
    const variable = index === 0 ? 'doy' : 'days';
    dispatch(updateSelectedOnsetVariable(variable));
  };

  const precipitationLegendData = PrecipitationLegendData.getInstance().data;

  const mapLegendProps: MapLegendProps = {
    data: precipitationLegendData,
    className: 'map-overlay-legend',
    title: 'Key: accumulated 24h precipitation, mm',
    labelInterval: 5,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-end',
      }}
    >
      <MapLegend key={selectedLayer} {...mapLegendProps} />
    </div>
  );
};

export default OnsetVariableSelector;
