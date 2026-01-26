export interface LegendData {
  levels: { [key: string]: string };
  hex_palette: { [key: string]: string };
}

class OnsetRainDaysAgoLegendData {
  private static instance: OnsetRainDaysAgoLegendData;

  public readonly data: LegendData = {
    levels: {
      '0': '1',
      '1': '2',
      '2': '3',
      '3': '4',
      '4': '5',
      '5': '6',
      '6': '7',
      '7': '8',
      '8': '9',
      '9': '10',
    },
    hex_palette: {
      '0': '#440154',
      '1': '#482475',
      '2': '#414487',
      '3': '#355f8d',
      '4': '#2a788e',
      '5': '#21918c',
      '6': '#22a884',
      '7': '#44bf70',
      '8': '#7ad151',
      '9': '#bddf26',
    },
  };

  private constructor() {
    // private to prevent direct construction
  }

  public static getInstance(): OnsetRainDaysAgoLegendData {
    if (!OnsetRainDaysAgoLegendData.instance) {
      OnsetRainDaysAgoLegendData.instance = new OnsetRainDaysAgoLegendData();
    }
    return OnsetRainDaysAgoLegendData.instance;
  }

  /**
   * Get the color for a specific level
   */
  public getColorForLevel(level: string | number): string | undefined {
    const levelKey = String(level);
    return this.data.hex_palette[levelKey];
  }

  /**
   * Get the level range label (e.g., "25_29") for a specific level
   */
  public getLevelRange(level: string | number): string | undefined {
    const levelKey = String(level);
    return this.data.levels[levelKey];
  }

  /**
   * Get all colors as an array
   */
  public getColorsArray(): string[] {
    return Object.keys(this.data.hex_palette)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => this.data.hex_palette[key]);
  }

  /**
   * Get the total number of levels
   */
  public getLevelCount(): number {
    return Object.keys(this.data.levels).length;
  }
}

export default OnsetRainDaysAgoLegendData;
