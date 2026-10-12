import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactSlider from 'react-slider';
import './Slider.css';
import { selectOverlayOpacity, updateOverlayOpacity } from './cumulusSlice';

const OpacitySlider = () => {
  const dispatch = useDispatch();
  const opacity = useSelector(selectOverlayOpacity);
  const percent = Math.round(opacity * 100);

  // Same markup and classes as the lead time Slider so the bars line up
  return (
    <div className="slider-wrapper">
      <div className="slider">
        <div className="slider-time-label">Opacity: {percent}%</div>
        <div className="slider-controls">
          <div className="slider-container">
            <ReactSlider
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              withTracks
              min={0}
              max={100}
              step={5}
              value={percent}
              ariaLabel="Opacity"
              onChange={(value: number) =>
                dispatch(updateOverlayOpacity(value / 100))
              }
            />
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpacitySlider;
