export interface LegendData {
  levels: { [key: string]: string };
  hex_palette: { [key: string]: string };
}

class PrecipitationLegendData {
  private static instance: PrecipitationLegendData;

  public readonly data: LegendData = {
    levels: {
      '0': '0.2_1.0',
      '1': '1.0_2.0',
      '2': '2.0_3.0',
      '3': '3.0_5.0',
      '4': '5.0_7.0',
      '5': '7.0_10.0',
      '6': '10.0_15.0',
      '7': '15.0_20.0',
      '8': '20.0_30.0',
      '9': '30.0_50.0',
      '10': '50.0_200.0',
    },
    hex_palette: {
      '0': '#2579d4',
      '1': '#2a8cf0',
      '2': '#1cd0f5',
      '3': '#428730',
      '4': '#31c749',
      '5': '#63dd54',
      '6': '#f9e063',
      '7': '#fbc65b',
      '8': '#fb8349',
      '9': '#fd5740',
      '10': '#b31b27',
    },
  };

  private constructor() {
    // private to prevent direct construction
  }

  public static getInstance(): PrecipitationLegendData {
    if (!PrecipitationLegendData.instance) {
      PrecipitationLegendData.instance = new PrecipitationLegendData();
    }
    return PrecipitationLegendData.instance;
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

export default PrecipitationLegendData;
