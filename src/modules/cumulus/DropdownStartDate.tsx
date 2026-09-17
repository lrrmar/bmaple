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
  const [selectedDate, setSelectedDate] = useState<string>();

  useEffect(() => {
    /* Initial date setup */

    /* Array of selectable start dates */
    const startDates: Date[] = [];
    startDates.push(new Date('2026-09-11'));
    startDates.push(new Date('2026-09-09'));
    startDates.push(new Date('2026-09-07'));

    const options = startDates.map((date) => {
      const timestamp = date.getTime();
      return {
        value: timestamp,
        label: dateDisplayString(timestamp),
      };
    });

    setDateOptions(options);

    // convert date to yyyy-mm-dd string
    //const initialDate = new Date(options[0].value);
    //const yyyy = initialDate.getFullYear();
    //const mm = String(initialDate.getMonth() + 1).padStart(2, '0');
    //const dd = String(initialDate.getDate()).padStart(2, '0');
    //setSelectedDate(`${yyyy}-${mm}-${dd}`);
    //setSelectedDate('2026-09-11');
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ts = parseInt(event.target.value, 10);

    console.log('timestamp selected: ' + ts);
    // convert date to yyyy-mm-dd string
    const initialDate = new Date(ts);
    const yyyy = initialDate.getFullYear();
    const mm = String(initialDate.getMonth() + 1).padStart(2, '0');
    const dd = String(initialDate.getDate()).padStart(2, '0');

    console.log('selected date string: ' + `${yyyy}-${mm}-${dd}`);
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Handle changes to date selection
  useEffect(() => {
    console.log('selectedDate:' + selectedDate);

    if (!selectedDate) {
      return;
    }

    dispatch(updateSelectedDayOfYear(selectedDate));
  }, [selectedDate]);

  return (
    <div className="dropdown-container">
      <label htmlFor="start-date-dropdown" className="dropdown-label">
        Forecast start date:
      </label>
      <select
        id="start-date-dropdown"
        className="dropdown-select"
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
