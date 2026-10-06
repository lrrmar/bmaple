import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './Dropdown.css';
import { updateSelectedAccumDays } from './cumulusSlice';
import {
  dateDisplayString,
  timestampAsUrlParamString,
} from './dateFormatHelpers';

const DropdownAccumDays = () => {
  const dispatch = useDispatch();

  const [accumDaysOptions, setAccumDaysOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [selectedAccumDays, setSelectedAccumDays] = useState<number>();

  useEffect(() => {
    /* Initial date setup */

    /* Array of selectable start dates */
    const dayss: number[] = [];
    dayss.push(1);
    dayss.push(3);
    dayss.push(5);
    dayss.push(7);
    dayss.push(10);

    const options = dayss.map((accumDays) => {
      const label = `${accumDays} day${accumDays > 1 ? 's' : ''}`;
      return {
        value: accumDays,
        label: label,
      };
    });

    setAccumDaysOptions(options);
  }, []);

  const handleAccumDayChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const accumDays = parseInt(event.target.value, 10);

    console.log('accum days selected: ' + accumDays);

    setSelectedAccumDays(accumDays);
  };

  // Handle changes to date selection
  useEffect(() => {
    console.log('selectedAccumDays:' + selectedAccumDays);

    if (!selectedAccumDays) {
      return;
    }

    dispatch(updateSelectedAccumDays(selectedAccumDays));
  }, [selectedAccumDays]);

  return (
    <div className="dropdown-container">
      <label htmlFor="start-date-dropdown" className="dropdown-label">
        Accumulation period
      </label>
      <select
        id="start-date-dropdown"
        className="dropdown-select"
        onChange={handleAccumDayChange}
      >
        {accumDaysOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownAccumDays;
