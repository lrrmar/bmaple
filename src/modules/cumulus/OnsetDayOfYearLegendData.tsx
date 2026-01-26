export interface LegendData {
  levels: { [key: string]: string };
  hex_palette: { [key: string]: string };
}

class OnsetDayOfYearLegendData {
  private static instance: OnsetDayOfYearLegendData;

  public readonly data: LegendData = {
    levels: {
      '0': '25_29',
      '1': '30_34',
      '2': '35_39',
      '3': '40_44',
      '4': '45_49',
      '5': '50_54',
      '6': '55_59',
      '7': '60_64',
      '8': '65_69',
      '9': '70_74',
      '10': '75_79',
      '11': '80_84',
      '12': '85_89',
      '13': '90_94',
      '14': '95_99',
      '15': '100_104',
      '16': '105_109',
      '17': '110_114',
      '18': '115_119',
      '19': '120_124',
      '20': '125_129',
      '21': '130_134',
      '22': '135_139',
      '23': '140_144',
      '24': '145_149',
      '25': '150_154',
      '26': '155_159',
      '27': '160_164',
      '28': '165_169',
      '29': '170_174',
      '30': '175_179',
      '31': '180_184',
      '32': '185_189',
      '33': '190_194',
      '34': '195_199',
      '35': '200_204',
      '36': '205_209',
      '37': '210_214',
      '38': '215_219',
      '39': '220_224',
      '40': '225_229',
    },
    hex_palette: {
      '0': '#440154',
      '1': '#460a5d',
      '2': '#471365',
      '3': '#481b6d',
      '4': '#482374',
      '5': '#472c7a',
      '6': '#46337f',
      '7': '#443a83',
      '8': '#424186',
      '9': '#3e4989',
      '10': '#3c508b',
      '11': '#39568c',
      '12': '#365d8d',
      '13': '#32648e',
      '14': '#306a8e',
      '15': '#2d708e',
      '16': '#2b758e',
      '17': '#287c8e',
      '18': '#26828e',
      '19': '#24878e',
      '20': '#228d8d',
      '21': '#20938c',
      '22': '#1f998a',
      '23': '#1f9f88',
      '24': '#20a486',
      '25': '#25ab82',
      '26': '#2ab07f',
      '27': '#32b67a',
      '28': '#3bbb75',
      '29': '#48c16e',
      '30': '#54c568',
      '31': '#60ca60',
      '32': '#6ece58',
      '33': '#7fd34e',
      '34': '#8ed645',
      '35': '#9dd93b',
      '36': '#addc30',
      '37': '#c0df25',
      '38': '#d0e11c',
      '39': '#dfe318',
      '40': '#efe51c',
    },
  };

  private constructor() {
    // private to prevent direct construction
  }

  public static getInstance(): OnsetDayOfYearLegendData {
    if (!OnsetDayOfYearLegendData.instance) {
      OnsetDayOfYearLegendData.instance = new OnsetDayOfYearLegendData();
    }
    return OnsetDayOfYearLegendData.instance;
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

export default OnsetDayOfYearLegendData;
