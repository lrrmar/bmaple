import { rainfallLegendData } from './rainfallColourScale';

export interface LegendData {
  levels: { [key: string]: string };
  hex_palette: { [key: string]: string };
}

class PrecipitationLegendData {
  private static instance: PrecipitationLegendData;

  public readonly data: LegendData = rainfallLegendData;

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
