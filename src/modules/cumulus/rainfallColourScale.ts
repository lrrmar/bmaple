export interface RainfallColourBin {
  minimumMm: number;
  label: string;
  colour: string;
}

// Bins include their lower bound; rainfall below the first bin is transparent.
export const rainfallColourScale: readonly RainfallColourBin[] = [
  { minimumMm: 0.2, label: '0.2_1.0', colour: '#2579d4' },
  { minimumMm: 1, label: '1.0_2.0', colour: '#2a8cf0' },
  { minimumMm: 2, label: '2.0_3.0', colour: '#1cd0f5' },
  { minimumMm: 3, label: '3.0_5.0', colour: '#428730' },
  { minimumMm: 5, label: '5.0_7.0', colour: '#31c749' },
  { minimumMm: 7, label: '7.0_10.0', colour: '#63dd54' },
  { minimumMm: 10, label: '10.0_15.0', colour: '#f9e063' },
  { minimumMm: 15, label: '15.0_20.0', colour: '#fbc65b' },
  { minimumMm: 20, label: '20.0_30.0', colour: '#fb8349' },
  { minimumMm: 30, label: '30.0_50.0', colour: '#fd5740' },
  { minimumMm: 50, label: '>50.0', colour: '#b31b27' },
];

export const rainfallLegendData = {
  levels: Object.fromEntries(
    rainfallColourScale.map((bin, index) => [String(index), bin.label]),
  ),
  hex_palette: Object.fromEntries(
    rainfallColourScale.map((bin, index) => [String(index), bin.colour]),
  ),
};
