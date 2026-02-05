export type AutoSortieFormKey  =
  | 'Departure Airport'
  | 'Landing Airport'
  | 'Planned T/O Time'
  | 'FIRS / Zones'

export type EditSortieFormKey = 
  | 'Mission Scientist'
  | 'Author'
  | 'Approver'
  | 'Scientific Aims'
  | 'Weather Conditions'
  | 'Instrument Servicability'
  | 'Special Notes ';

export type SortieFormKey = AutoSortieFormKey | EditSortieFormKey;

export type SortieInfo = Record<SortieFormKey, string>;

export const AutosortieFormKeys: AutoSortieFormKey[] = [
  'Planned T/O Time',
  'Departure Airport',
  'Landing Airport',
  'FIRS / Zones',
]

export const EditSortieFormKeys: EditSortieFormKey[] = [
  'Mission Scientist',
  'Author',
  'Approver',
  'Scientific Aims',
  'Weather Conditions',
  'Instrument Servicability',
  'Special Notes ',
]

export const SortieFormKeys: SortieFormKey[] = [
  'Planned T/O Time',
  'Departure Airport',
  'Landing Airport',
  'FIRS / Zones',
  'Mission Scientist',
  'Author',
  'Approver',
  'Scientific Aims',
  'Weather Conditions',
  'Instrument Servicability',
  'Special Notes ',
]

export type TextInputSubmitProps = {
  onSubmit: (value: string) => void;
  defaultValue?: string;
};

