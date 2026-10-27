import React from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import {
  selectInterpolationEnabled,
  updateInterpolationEnabled,
} from './cumulusSlice';
import './Dropdown.css';

const InterpolationToggle = () => {
  const dispatch = useDispatch();
  const enabled = useSelector(selectInterpolationEnabled);
  return (
    <div className="dropdown-container">
      <label className="dataset-toggle">
        <span>Interpolation</span>
        <input
          type="checkbox"
          role="switch"
          checked={enabled}
          onChange={(event) =>
            dispatch(updateInterpolationEnabled(event.target.checked))
          }
        />
        <span className="dataset-toggle-track" aria-hidden="true" />
      </label>
    </div>
  );
};

export default InterpolationToggle;
