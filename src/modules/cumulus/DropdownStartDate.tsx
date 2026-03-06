import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './Dropdown.css';
import { updateSelectedDayOfYear } from './cumulusSlice';
import {
  dateDisplayString,
  timestampAsUrlParamString,
} from './dateFormatHelpers';

const DropdownStartDate = () => {
  const dispatch = useDispatch();

  const [dateOptions, setDateOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<number>();

  useEffect(() => {
    /* Initial date setup */
    const startDate = new Date('2025-02-01');
    const endDate = new Date('2025-08-31');

    // Calculate difference in days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options = [...Array(diffDays + 1)].map((_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const timestamp = date.getTime();
      return {
        value: timestamp,
        label: dateDisplayString(timestamp),
      };
    });

    setDateOptions(options);
    setSelectedDate(options[0].value);
  }, []);

  // Handle changes to date selection
  useEffect(() => {
    console.log('selectedDate:' + selectedDate);

    if (!selectedDate) {
      return;
    }

    const urlString = timestampAsUrlParamString(selectedDate);
    dispatch(updateSelectedDayOfYear(urlString));
  }, [selectedDate, dispatch]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const timestamp = parseInt(event.target.value, 10);
    setSelectedDate(timestamp);
  };

  return (
    <div className="dropdown-container">
      <label htmlFor="start-date-dropdown" className="dropdown-label">
        Forecast start date:
      </label>
      <select
        id="start-date-dropdown"
        className="dropdown-select"
        value={selectedDate}
        onChange={handleDateChange}
      >
        {dateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownStartDate;
