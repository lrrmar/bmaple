import chroma from 'chroma-js';

const viridis = (n: number): string[] =>
  chroma.scale(['#440154', '#21908d', '#fde725']).mode('lab').colors(n);

const whiteBlue = (n: number): string[] =>
  chroma.scale(['white', 'blue']).mode('lab').colors(n);

const IBM = (n: number): string[] =>
  chroma
    .scale(['#648fff', '#785ef0', '#dc267f', '#fe6100', '#ffb000'])
    .mode('lab')
    .colors(n);

const redBlue = (n: number): string[] =>
  chroma.scale(['blue', 'red']).mode('lab').colors(n);

const tol = (n: number): string[] =>
  chroma
    .scale([
      '#332288',
      '#117733',
      '#44AA99',
      '#88CCEE',
      '#DDCC77',
      '#CC6677',
      '#AA4499',
      '#882255',
    ])
    .mode('lab')
    .colors(n);

interface ColourPalettes {
  [key: string]: (n: number) => string[];
}
const colourPalettes: ColourPalettes = {
  viridis: viridis,
  'white-blue': whiteBlue,
  'red-blue': redBlue,
  IBM: IBM,
  tol: tol,
};

export default colourPalettes;
