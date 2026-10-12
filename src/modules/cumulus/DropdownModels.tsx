import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Dropdown.css';
import {
  selectSelectedDownscalingModel,
  selectSelectedSubseasonalModel,
  updateSelectedDownscalingModel,
  updateSelectedSubseasonalModel,
} from './cumulusSlice';
import models from './models.json';
import { subseasonalModelKey } from './modelPaths';

const unique = (values: string[]) => Array.from(new Set(values));

const subseasonalOptions = unique(models.map(subseasonalModelKey));

const downscalingOptions = unique(models.map((m) => m.downscaled_model_name));

interface ModelDropdownProps {
  id: string;
  label: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}

const ModelDropdown = ({
  id,
  label,
  options,
  value,
  onSelect,
}: ModelDropdownProps) => (
  <div className="dropdown-container">
    <label htmlFor={id} className="dropdown-label">
      {label}
    </label>
    <select
      id={id}
      className="dropdown-select"
      value={value ?? ''}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
        onSelect(event.target.value)
      }
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export const DropdownSubseasonalModel = () => {
  const dispatch = useDispatch();
  const selected = useSelector(selectSelectedSubseasonalModel);
  return (
    <ModelDropdown
      id="subseasonal-model-dropdown"
      label="Subseasonal Model"
      options={subseasonalOptions}
      value={selected}
      onSelect={(v) => dispatch(updateSelectedSubseasonalModel(v))}
    />
  );
};

export const DropdownDownscalingModel = () => {
  const dispatch = useDispatch();
  const selected = useSelector(selectSelectedDownscalingModel);
  return (
    <ModelDropdown
      id="downscaling-model-dropdown"
      label="Downscaling Model"
      options={downscalingOptions}
      value={selected}
      onSelect={(v) => dispatch(updateSelectedDownscalingModel(v))}
    />
  );
};
