export interface CatalogueProduct {
  forecast_model: string;
  subseasonal_model_head: string | null;
  downscaled_model: string | null;
  variant: string | null;
  checkpoint: string | null;
  run_type: 'coarse' | 'downscaled';
  run_date: string;
  region: string;
  product: string;
  png_path_template: string;
  data_crs: string;
  image_extent: {
    longitude_min: number;
    latitude_min: number;
    longitude_max: number;
    latitude_max: number;
  };
}

export interface Catalogue {
  schema_version: number;
  generated_at: string;
  products: CatalogueProduct[];
}

export interface DatasetSelection {
  downscaledEnabled: boolean;
  selectedSubseasonalModel: string | null;
  selectedDownscalingModel: string | null;
  selectedVariant: string | null;
  selectedCheckpoint: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNullableString = (value: unknown) =>
  value === null || typeof value === 'string';

const isProduct = (value: unknown): value is CatalogueProduct => {
  if (!isRecord(value) || !isRecord(value.image_extent)) return false;
  const extent = value.image_extent;
  return (
    ['forecast_model', 'region', 'product', 'data_crs'].every(
      (key) => typeof value[key] === 'string' && value[key] !== '',
    ) &&
    typeof value.run_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.run_date) &&
    Number.isFinite(Date.parse(`${value.run_date}T00:00:00Z`)) &&
    [
      'subseasonal_model_head',
      'downscaled_model',
      'variant',
      'checkpoint',
    ].every((key) => isNullableString(value[key])) &&
    (value.run_type === 'coarse' || value.run_type === 'downscaled') &&
    (value.run_type !== 'downscaled' ||
      (typeof value.downscaled_model === 'string' &&
        value.downscaled_model !== '')) &&
    typeof value.png_path_template === 'string' &&
    value.png_path_template.includes('{accumulation}') &&
    value.png_path_template.includes('{lead_hours:04d}') &&
    !value.png_path_template.startsWith('/') &&
    !value.png_path_template.includes('..') &&
    !value.png_path_template.includes('://') &&
    ['longitude_min', 'latitude_min', 'longitude_max', 'latitude_max'].every(
      (key) => typeof extent[key] === 'number' && Number.isFinite(extent[key]),
    ) &&
    Number(extent.longitude_min) < Number(extent.longitude_max) &&
    Number(extent.latitude_min) < Number(extent.latitude_max)
  );
};

export const catalogueRoot = (baseUrl: string) => {
  const root = baseUrl.replace(/\/+$/, '');
  return root.endsWith('/png') ? root : `${root}/png`;
};

export const fetchCatalogue = async (
  baseUrl: string,
  signal?: AbortSignal,
): Promise<Catalogue> => {
  const response = await fetch(`${catalogueRoot(baseUrl)}/catalogue.json`, {
    signal,
    cache: 'no-cache',
  });
  if (!response.ok) {
    throw new Error(`Catalogue request failed (${response.status})`);
  }
  const value: unknown = await response.json();
  if (
    !isRecord(value) ||
    value.schema_version !== 2 ||
    typeof value.generated_at !== 'string' ||
    !Array.isArray(value.products) ||
    !value.products.every(isProduct)
  ) {
    throw new Error('Invalid or unsupported dataset catalogue');
  }
  return {
    schema_version: value.schema_version,
    generated_at: value.generated_at,
    products: value.products,
  };
};

export const subseasonalKey = (product: CatalogueProduct) =>
  product.subseasonal_model_head
    ? `${product.forecast_model}-${product.subseasonal_model_head}`
    : product.forecast_model;

export const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

type ModelSelection = Pick<
  DatasetSelection,
  'selectedSubseasonalModel' | 'selectedDownscalingModel' | 'downscaledEnabled'
>;

export const matchesModelSelection = (
  product: CatalogueProduct,
  selection: ModelSelection,
) =>
  subseasonalKey(product) === selection.selectedSubseasonalModel &&
  (selection.downscaledEnabled
    ? product.run_type === 'downscaled' &&
      product.downscaled_model === selection.selectedDownscalingModel
    : product.run_type === 'coarse');

export const matchingProducts = (
  products: CatalogueProduct[],
  selection: DatasetSelection,
) =>
  products.filter(
    (product) =>
      matchesModelSelection(product, selection) &&
      product.variant === selection.selectedVariant &&
      product.checkpoint === selection.selectedCheckpoint,
  );

export const availableRunDates = (
  products: CatalogueProduct[],
  selection: ModelSelection,
) =>
  unique(
    products
      .filter((product) => matchesModelSelection(product, selection))
      .map((product) => product.run_date),
  )
    .sort()
    .reverse();

export const buildPngUrl = (
  baseUrl: string,
  product: CatalogueProduct,
  accumDays: number,
  leadEntry: string,
) =>
  `${catalogueRoot(baseUrl)}/${product.png_path_template
    .replace('{accumulation}', `${accumDays}day`)
    .replace(
      '{lead_hours:04d}',
      String(parseInt(leadEntry, 10)).padStart(4, '0'),
    )}`;
