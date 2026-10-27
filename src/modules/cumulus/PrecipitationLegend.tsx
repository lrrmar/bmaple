import React, { useState } from 'react';
import MapLegend, { MapLegendProps } from './MapLegend';
import PrecipitationLegendData from './PrecipitationLegendData';
import { selectSelectedAccumDays } from './cumulusSlice';
import { useDispatch, useSelector } from 'react-redux';

const OnsetVariableSelector = () => {
  const dispatch = useDispatch();
  const accumDays = useSelector(selectSelectedAccumDays) ?? 1;

  const [selectedLayer, setSelectedLayer] = useState(0); // 0 = Day of Year, 1 = Rain Days Ago

  const precipitationLegendData = PrecipitationLegendData.getInstance().data;

  const mapLegendProps: MapLegendProps = {
    data: precipitationLegendData,
    className: 'map-overlay-legend',
    title: `Key: accumulated ${accumDays}-day precipitation, mm`,
    labelInterval: 5,
    width: '100%',
  };

  return (
    <div className="map-legend-anchor">
      <MapLegend key={selectedLayer} {...mapLegendProps} />
    </div>
  );
};

export default OnsetVariableSelector;
