import React, { useEffect } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import './Dropdown.css';
import {
  loadCatalogue,
  selectCatalogue,
  selectCatalogueError,
  selectCatalogueStatus,
  selectDownscaledEnabled,
  selectDatasetMatch,
  selectSelectedCheckpoint,
  selectSelectedModelRunDate,
  selectSelectedDownscalingModel,
  selectSelectedSubseasonalModel,
  selectSelectedVariant,
  updateSelectedCheckpoint,
  updateSelectedDownscalingModel,
  updateSelectedSubseasonalModel,
  updateSelectedVariant,
  updateDownscaledEnabled,
} from './cumulusSlice';
import { matchesModelSelection, subseasonalKey, unique } from './catalogue';
import WrappedDropdown from './WrappedDropdown';

export const CatalogueStatus = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectCatalogueStatus);
  const error = useSelector(selectCatalogueError);
  const catalogue = useSelector(selectCatalogue);
  const { error: selectionError } = useSelector(selectDatasetMatch);
  useEffect(() => {
    if (status === 'idle') void dispatch(loadCatalogue());
  }, [dispatch, status]);

  return (
    <>
      {status === 'loading' && (
        <div className="catalogue-message" role="status">
          Loading datasets...
        </div>
      )}
      {error && (
        <div className="catalogue-message" role="alert">
          Could not load the dataset catalogue: {error}. Check network access
          and the storage CORS rules for this site.
          <button type="button" onClick={() => void dispatch(loadCatalogue())}>
            Retry
          </button>
        </div>
      )}
      {selectionError && (
        <div className="catalogue-message" role="alert">
          {selectionError}
        </div>
      )}
      {status === 'ready' && catalogue?.products.length === 0 && (
        <div className="catalogue-message" role="status">
          No datasets are available in the catalogue.
        </div>
      )}
    </>
  );
};

interface ModelDropdownProps {
  id: string;
  label: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const ModelDropdown = ({
  id,
  label,
  options,
  value,
  onSelect,
  disabled = false,
}: ModelDropdownProps) => (
  <div className="dropdown-container">
    <label
      htmlFor={id}
      className={`dropdown-label${disabled ? ' dropdown-label-muted' : ''}`}
    >
      {label}
    </label>
    <select
      id={id}
      className="dropdown-select"
      value={value ?? ''}
      disabled={disabled || options.length === 0}
      onChange={(event) => onSelect(event.target.value)}
    >
      {options.length === 0 && <option value="">No datasets available</option>}
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
  const catalogue = useSelector(selectCatalogue);
  return (
    <ModelDropdown
      id="subseasonal-model-dropdown"
      label="Subseasonal Model"
      options={unique((catalogue?.products ?? []).map(subseasonalKey)).sort()}
      value={selected}
      onSelect={(value) => dispatch(updateSelectedSubseasonalModel(value))}
    />
  );
};

export const DropdownDownscalingModel = () => {
  const dispatch = useDispatch();
  const selected = useSelector(selectSelectedDownscalingModel);
  const model = useSelector(selectSelectedSubseasonalModel);
  const catalogue = useSelector(selectCatalogue);
  const enabled = useSelector(selectDownscaledEnabled);
  const options = unique(
    (catalogue?.products ?? [])
      .filter(
        (product) =>
          subseasonalKey(product) === model &&
          product.run_type === 'downscaled',
      )
      .map((product) => product.downscaled_model),
  )
    .filter((value): value is string => value !== null)
    .sort();
  return (
    <ModelDropdown
      id="downscaling-model-dropdown"
      label="Downscaling Model"
      options={options}
      value={selected}
      disabled={!enabled}
      onSelect={(value) => dispatch(updateSelectedDownscalingModel(value))}
    />
  );
};

export const DownscaledToggle = () => {
  const dispatch = useDispatch();
  const enabled = useSelector(selectDownscaledEnabled);
  const model = useSelector(selectSelectedSubseasonalModel);
  const catalogue = useSelector(selectCatalogue);
  const canSwitch = (catalogue?.products ?? []).some(
    (product) =>
      subseasonalKey(product) === model &&
      product.run_type === (enabled ? 'coarse' : 'downscaled'),
  );
  return (
    <div className="dropdown-container">
      <label className="dataset-toggle">
        <span>Coarse</span>
        <input
          type="checkbox"
          role="switch"
          aria-label="Downscaled"
          checked={enabled}
          disabled={!canSwitch}
          onChange={(event) =>
            dispatch(updateDownscaledEnabled(event.target.checked))
          }
        />
        <span className="dataset-toggle-track" aria-hidden="true" />
        <span>Downscaled</span>
      </label>
    </div>
  );
};

export const DropdownDatasetConfiguration = () => {
  const dispatch = useDispatch();
  const catalogue = useSelector(selectCatalogue);
  const model = useSelector(selectSelectedSubseasonalModel);
  const downscaling = useSelector(selectSelectedDownscalingModel);
  const variant = useSelector(selectSelectedVariant);
  const checkpoint = useSelector(selectSelectedCheckpoint);
  const runDate = useSelector(selectSelectedModelRunDate);
  const downscaledEnabled = useSelector(selectDownscaledEnabled);
  const candidates = (catalogue?.products ?? []).filter(
    (product) =>
      matchesModelSelection(product, {
        selectedSubseasonalModel: model,
        selectedDownscalingModel: downscaling,
        downscaledEnabled,
      }) && product.run_date === runDate,
  );
  const variants = unique(candidates.map((product) => product.variant)).sort();
  const checkpoints = unique(
    candidates
      .filter((product) => product.variant === variant)
      .map((product) => product.checkpoint),
  ).sort();
  const options = (values: (string | null)[]) =>
    values.map((value) => ({ value, label: value ?? 'Not specified' }));

  return (
    <>
      {downscaledEnabled && variants.some((value) => value !== null) && (
        <WrappedDropdown
          key={`variant-${model}-${downscaling}-${runDate}`}
          id="downscaling-variant"
          label="Downscaling variant"
          options={options(variants)}
          value={variant}
          onSelect={(value) => dispatch(updateSelectedVariant(value))}
        />
      )}
      {checkpoints.some((value) => value !== null) && (
        <WrappedDropdown
          key={`checkpoint-${model}-${downscaling}-${runDate}-${variant}`}
          id="model-checkpoint"
          label={
            downscaledEnabled
              ? 'Downscaling checkpoint'
              : candidates[0]?.forecast_model === 'aurora'
                ? 'Aurora checkpoint'
                : 'Subseasonal checkpoint'
          }
          options={options(checkpoints)}
          value={checkpoint}
          onSelect={(value) => dispatch(updateSelectedCheckpoint(value))}
        />
      )}
    </>
  );
};
