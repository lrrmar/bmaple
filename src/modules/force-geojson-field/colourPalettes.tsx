import chroma from 'chroma-js';

const viridis = (n: number): string[] =>
  chroma.scale(['#440154', '#21908d', '#fde725']).mode('lab').colors(n);

const whiteBlue = (n: number): string[] =>
  chroma.scale(['white', 'blue']).mode('lab').colors(n);

interface ColourPalettes {
  [key: string]: (n: number) => string[];
}
const colourPalettes: ColourPalettes = {
  viridis: viridis,
  'white-blue': whiteBlue,
};

export default colourPalettes;
