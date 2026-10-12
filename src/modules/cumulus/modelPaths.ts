import models from './models.json';

interface ModelEntry {
  subseasonal_model_name: string;
  subseasonal_model_head?: string;
  downscaled_model_name: string;
  input_relative_path: string;
  output_relative_path: string;
}

const entries = models as ModelEntry[];

// eg "aurora-imerg", or just "ifs" when there is no head
export const subseasonalModelKey = (m: ModelEntry) =>
  m.subseasonal_model_head
    ? `${m.subseasonal_model_name}-${m.subseasonal_model_head}`
    : m.subseasonal_model_name;

export const findModelEntry = (
  subseasonalModel: string | null,
  downscalingModel: string | null,
): ModelEntry | undefined =>
  entries.find(
    (m) =>
      subseasonalModelKey(m) === subseasonalModel &&
      m.downscaled_model_name === downscalingModel,
  );

/* Relative output path for a model combination with [run_date] substituted,
 * without leading/trailing slashes. Undefined if the combination is not in
 * models.json. */
export const getOutputRelativePath = (
  subseasonalModel: string | null,
  downscalingModel: string | null,
  runDate: string,
): string | undefined => {
  const entry = findModelEntry(subseasonalModel, downscalingModel);
  if (!entry) return undefined;
  return entry.output_relative_path
    .replace('[run_date]', runDate)
    .replace(/^\/+|\/+$/g, '');
};
