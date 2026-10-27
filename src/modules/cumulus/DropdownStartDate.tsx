import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './Dropdown.css';
import {
  selectAvailableRunDates,
  selectSelectedModelRunDate,
  updateSelectedModelRunDate,
} from './cumulusSlice';
import { dateDisplayString } from './dateFormatHelpers';

const DropdownStartDate = () => {
  const dispatch = useDispatch();
  const dates = useSelector(selectAvailableRunDates);
  const selectedDate = useSelector(selectSelectedModelRunDate);

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
          onClick={() => dispatch(updateSelectedModelRunDate(dates[index + 1]))}
        >
          ◀
        </button>
        <select
          id="start-date-dropdown"
          className="dropdown-select"
          value={selectedDate ?? ''}
          disabled={dates.length === 0}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            dispatch(updateSelectedModelRunDate(event.target.value))
          }
        >
          {dates.length === 0 && (
            <option value="">No run dates available</option>
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
          onClick={() => dispatch(updateSelectedModelRunDate(dates[index - 1]))}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default DropdownStartDate;
