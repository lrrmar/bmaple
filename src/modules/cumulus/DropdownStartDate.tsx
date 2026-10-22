import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Dropdown.css';
import {
  selectBaseUrl,
  selectRunDatesByCombo,
  selectSelectedAccumDays,
  selectSelectedDayOfYear,
  selectSelectedForecastDate,
  selectSelectedDownscalingModel,
  selectSelectedSubseasonalModel,
  updateRunDatesByCombo,
  updateSelectedDayOfYear,
} from './cumulusSlice';
import { dateDisplayString } from './dateFormatHelpers';
import { isDateString, pickRunDate } from './forecastDates';
import { discoverRunDates, findModelEntry } from './modelPaths';

const DropdownStartDate = () => {
  const dispatch = useDispatch();
  const baseUrl = useSelector(selectBaseUrl);
  const runDatesByCombo = useSelector(selectRunDatesByCombo);
  const selectedDate = useSelector(selectSelectedDayOfYear);
  const forecastDate = useSelector(selectSelectedForecastDate);
  const accumDays = useSelector(selectSelectedAccumDays);
  const subseasonalModel = useSelector(selectSelectedSubseasonalModel);
  const downscalingModel = useSelector(selectSelectedDownscalingModel);

  // Discover available run dates once; later model changes use the cached result
  useEffect(() => {
    discoverRunDates(baseUrl)
      .then((dates) => dispatch(updateRunDatesByCombo(dates)))
      .catch((error) =>
        console.error('Failed to discover model run dates:', error),
      );
  }, []);

  const comboName = findModelEntry(
    subseasonalModel,
    downscalingModel,
  )?.combination_name;
  const dates = (comboName && runDatesByCombo?.[comboName]) || [];

  // Keep the selected date valid for the chosen model combination
  useEffect(() => {
    if (dates.length === 0 || (selectedDate && dates.includes(selectedDate))) {
      return;
    }
    // Keep the forecast date if possible, otherwise get as near to it as we can
    const best = isDateString(forecastDate)
      ? pickRunDate(dates, forecastDate, accumDays)
      : null;
    dispatch(updateSelectedDayOfYear(best ?? dates[0]));
  }, [dates, selectedDate]);

  // dates are newest first: a higher index is an earlier run date
  const index = selectedDate ? dates.indexOf(selectedDate) : -1;
  const hasEarlier = index >= 0 && index < dates.length - 1;
  const hasLater = index > 0;

  return (
    <div className="dropdown-container">
      <label htmlFor="start-date-dropdown" className="dropdown-label">
        Model run date:
      </label>
      <div className="dropdown-row">
        <button
          type="button"
          className="dropdown-step-button"
          aria-label="Earlier model run date"
          disabled={!hasEarlier}
          onClick={() => dispatch(updateSelectedDayOfYear(dates[index + 1]))}
        >
          ◀
        </button>
        <select
          id="start-date-dropdown"
          className="dropdown-select"
          value={selectedDate ?? ''}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            dispatch(updateSelectedDayOfYear(event.target.value))
          }
        >
          {dates.length === 0 && selectedDate && (
            <option value={selectedDate}>{selectedDate}</option>
          )}
          {dates.map((date) => (
            <option key={date} value={date}>
              {dateDisplayString(new Date(`${date}T12:00:00`).getTime())}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="dropdown-step-button"
          aria-label="Later model run date"
          disabled={!hasLater}
          onClick={() => dispatch(updateSelectedDayOfYear(dates[index - 1]))}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default DropdownStartDate;
