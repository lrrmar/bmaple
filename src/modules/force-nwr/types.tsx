export const discreteHeaders = [
  'domain',
  'field',
  'plot',
  'location',
  'start_time',
] as const;

export const continuousHeaders = ['valid_time', 'level'] as const;

export type DiscreteHeader = (typeof discreteHeaders)[number];
export type ContinuousHeader = (typeof continuousHeaders)[number];

export type ContinuousMetaData = Record<ContinuousHeader, string>;
export type DiscreteMetaData = Record<DiscreteHeader, string | null>;
export type BackendDiscreteMetaData = Record<DiscreteHeader, string[]>;

export type Query = Record<ContinuousHeader | DiscreteHeader, string | null>;
export type Hash = Record<
  ContinuousHeader | DiscreteHeader | 'id',
  string | null
>;

export function buildRecord<K extends readonly string[], V>(
  keys: K,
  valueFor: (key: K[number]) => V,
): Record<K[number], V> {
  return Object.fromEntries(keys.map((k) => [k, valueFor(k)])) as Record<
    K[number],
    V
  >;
}

export default {};
