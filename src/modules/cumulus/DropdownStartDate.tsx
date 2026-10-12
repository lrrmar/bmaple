import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Dropdown.css';
import {
  selectBaseUrl,
  selectRunDatesByCombo,
  selectSelectedDayOfYear,
  selectSelectedDownscalingModel,
  selectSelectedSubseasonalModel,
  updateRunDatesByCombo,
  updateSelectedDayOfYear,
} from './cumulusSlice';
import { dateDisplayString } from './dateFormatHelpers';
import { discoverRunDates, findModelEntry } from './modelPaths';

const DropdownStartDate = () => {
  const dispatch = useDispatch();
  const baseUrl = useSelector(selectBaseUrl);
  const runDatesByCombo = useSelector(selectRunDatesByCombo);
  const selectedDate = useSelector(selectSelectedDayOfYear);
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
    dispatch(updateSelectedDayOfYear(dates[0]));
  }, [dates, selectedDate]);

  return (
    <div className="dropdown-container">
      <label htmlFor="start-date-dropdown" className="dropdown-label">
        Model run date:
      </label>
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
    </div>
  );
};

export default DropdownStartDate;
