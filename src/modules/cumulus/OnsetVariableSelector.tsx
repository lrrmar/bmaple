import React, { useState } from 'react';
import MapLegend, { MapLegendProps } from './MapLegend';
import OnsetDayOfYearLegendData from './OnsetDayOfYearLegendData';
import OnsetRainDaysAgoLegendData from './OnsetRainDaysAgoLegendData';
import SegmentedControl from './SegmentedControl';
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

  const dayOfYearLegendData = OnsetDayOfYearLegendData.getInstance().data;
  const rainDaysAgoLegendData = OnsetRainDaysAgoLegendData.getInstance().data;

  const mapLegendProps: MapLegendProps =
    selectedLayer === 0
      ? {
          data: dayOfYearLegendData,
          className: 'map-overlay-legend',
          title: 'Key: onset day of year',
          labelInterval: 5,
        }
      : {
          data: rainDaysAgoLegendData,
          className: 'map-overlay-legend',
          title: 'Key: rain days ago',
          labelInterval: 1,
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
      <SegmentedControl
        options={['Onset Day of Year', 'Rain Days Ago']}
        selectedIndex={selectedLayer}
        onChange={handleLayerChange}
      />
    </div>
  );
};

export default OnsetVariableSelector;
