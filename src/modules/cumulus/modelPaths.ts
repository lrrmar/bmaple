import models from './models.json';

interface ModelEntry {
  combination_name: string;
  subseasonal_model_name: string;
  subseasonal_model_head?: string;
  downscaled_model_name: string;
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

/* Run dates available per combination, keyed by combination_name. */
export type RunDatesByCombo = Record<string, string[]>;

const DATE_FOLDER = /^\d{4}-\d{2}-\d{2}$/;

// Splits eg https://acct.blob.core.windows.net/data into the container URL
// and any prefix path inside the container (empty when baseUrl is the container).
const splitBaseUrl = (baseUrl: string) => {
  const url = new URL(baseUrl);
  const [container, ...rest] = url.pathname.split('/').filter(Boolean);
  return {
    containerUrl: `${url.origin}/${container}`,
    prefix: rest.join('/'),
  };
};

const listBlobs = async (
  containerUrl: string,
  prefix: string,
  options: { delimiter?: string; maxResults?: number } = {},
): Promise<{ prefixes: string[]; blobCount: number }> => {
  const params = new URLSearchParams({
    restype: 'container',
    comp: 'list',
    prefix,
  });
  if (options.delimiter) params.set('delimiter', options.delimiter);
  if (options.maxResults) params.set('maxresults', String(options.maxResults));

  const response = await fetch(`${containerUrl}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Blob listing failed (${response.status}) for ${prefix}`);
  }
  const xml = new DOMParser().parseFromString(
    await response.text(),
    'application/xml',
  );
  const prefixes = Array.from(xml.querySelectorAll('BlobPrefix > Name')).map(
    (n) => n.textContent ?? '',
  );
  return { prefixes, blobCount: xml.querySelectorAll('Blob').length };
};

/* Discovers which run dates exist in blob storage for every model combination.
 * Output paths are relative to the container and contain [run_date], e.g.
 * live_coarse_png/ifs/[run_date]/cf/... . Lists the run date folders in front
 * of [run_date], then checks each date actually contains the rest of the
 * combination's output path. */
export const discoverRunDates = async (
  baseUrl: string,
): Promise<RunDatesByCombo> => {
  const { containerUrl, prefix } = splitBaseUrl(baseUrl);
  const root = prefix ? `${prefix}/` : '';

  const parentOf = (m: ModelEntry) =>
    m.output_relative_path.split('[run_date]')[0];

  const datesByParent: Record<string, string[]> = {};
  await Promise.all(
    Array.from(new Set(entries.map(parentOf))).map(async (parent) => {
      const { prefixes } = await listBlobs(containerUrl, `${root}${parent}`, {
        delimiter: '/',
      });
      datesByParent[parent] = prefixes
        .map((p) => p.split('/').filter(Boolean).pop() ?? '')
        .filter((d) => DATE_FOLDER.test(d));
    }),
  );

  const result: RunDatesByCombo = {};
  await Promise.all(
    entries.map(async (m) => {
      const candidates = datesByParent[parentOf(m)] ?? [];
      const checks = await Promise.all(
        candidates.map(async (date) => {
          const path = m.output_relative_path
            .replace('[run_date]', date)
            .replace(/^\/+|\/+$/g, '');
          const { blobCount } = await listBlobs(
            containerUrl,
            `${root}${path}/`,
            { maxResults: 1 },
          );
          return blobCount > 0 ? date : null;
        }),
      );
      result[m.combination_name] = checks
        .filter((d): d is string => d !== null)
        .sort()
        .reverse(); // newest first
    }),
  );
  return result;
};

// Models with no downscaling are on the coarse grid
export const isCoarseDownscalingModel = (downscalingModel: string | null) =>
  downscalingModel === 'none' || downscalingModel === 'coarse';
