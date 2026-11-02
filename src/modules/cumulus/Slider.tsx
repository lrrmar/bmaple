import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactSlider from 'react-slider';
import './Slider.css';
import {
  selectSelectedAccumDays,
  selectSelectedLeadTime,
  selectSelectedForecastDate,
  updateSelectedLeadTime,
} from './cumulusSlice';
import {
  addHours,
  formatLeadEntry,
  HOURS_PER_DAY,
  isDateString,
  minLeadHours,
  NUM_LEAD_SLOTS,
  parseLeadHours,
} from './forecastDates';

const Slider = () => {
  const dispatch = useDispatch();
  const accumDays = useSelector(selectSelectedAccumDays) ?? 1;
  const forecastDateValue = useSelector(selectSelectedForecastDate);
  const leadHours = parseLeadHours(useSelector(selectSelectedLeadTime));

  // Slider positions are daily lead time slots: index i is lead (i+1)*24h.
  // An N-day accumulation only exists from lead time N*24h.
  const minSliderValue = minLeadHours(accumDays) / HOURS_PER_DAY - 1;
  const currentSliderValue =
    leadHours === null
      ? minSliderValue
      : Math.max(minSliderValue, leadHours / HOURS_PER_DAY - 1);

  let forecastDate: string | null = null;
  if (isDateString(forecastDateValue)) {
    const end = new Date(`${forecastDateValue}T00:00:00Z`);
    if (accumDays > 1) {
      const start = new Date(
        `${addHours(forecastDateValue, -(accumDays - 1) * HOURS_PER_DAY)}T00:00:00Z`,
      );
      const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year:
          start.getUTCFullYear() !== end.getUTCFullYear()
            ? 'numeric'
            : undefined,
        timeZone: 'UTC',
      });
      forecastDate = `${formatter.format(start)} - ${formatter.format(end)}`;
    } else {
      forecastDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(end);
    }
  }

  return (
    <div className="slider-wrapper">
      <div className="slider-message"></div>
      <div className="slider">
        <div className="slider-time-label">
          Forecast date: {forecastDate ?? 'Select a model run date'}
          {forecastDate &&
            leadHours !== null &&
            ` (+${leadHours.toString().padStart(4, '0')}h)`}
          {accumDays > 1 && (
            <span className="slider-hint">
              {accumDays}-day accumulation available from +{accumDays * 24}h
            </span>
          )}
        </div>
        <div className="slider-controls">
          <div className="slider-container">
            <ReactSlider
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              withTracks
              onChange={(value) =>
                dispatch(
                  updateSelectedLeadTime(
                    formatLeadEntry((value + 1) * HOURS_PER_DAY),
                  ),
                )
              }
              value={currentSliderValue}
              //defaultValue={defaultSliderValue}
              markClassName="customSlider-mark"
              min={minSliderValue}
              max={NUM_LEAD_SLOTS - 1}
            />
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
