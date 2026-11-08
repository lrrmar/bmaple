import { decode } from 'fast-png';

import { RainfallColourBin, rainfallColourScale } from './rainfallColourScale';

export const decodeRainfall = (red: number, green: number): number | null => {
  const code = red * 256 + green;
  return code === 65535 ? null : code * 0.1;
};

export const colouriseRainfallPng = (
  bytes: ArrayBuffer,
  scale: readonly RainfallColourBin[] = rainfallColourScale,
) => {
  const png = decode(bytes, { checkCrc: true });
  if (png.depth !== 8 || png.channels !== 3 || png.palette) {
    throw new Error('Rainfall PNG must contain 8-bit RGB pixels');
  }
  if (
    scale.length === 0 ||
    scale.some(
      (bin, index) =>
        !Number.isFinite(bin.minimumMm) ||
        bin.minimumMm < 0 ||
        !/^#[0-9a-f]{6}$/i.test(bin.colour) ||
        (index > 0 && bin.minimumMm <= scale[index - 1].minimumMm),
    )
  ) {
    throw new Error('Invalid rainfall colour scale');
  }
  const colours = scale.map((bin) => {
    const hex = parseInt(bin.colour.slice(1), 16);
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  });
  const rgba = new Uint8ClampedArray(png.width * png.height * 4);
  for (let pixel = 0; pixel < png.width * png.height; pixel++) {
    const offset = pixel * 3;
    if (png.data[offset + 2] !== 0) {
      throw new Error('Rainfall PNG has a nonzero unused blue channel');
    }
    const rainfall = decodeRainfall(png.data[offset], png.data[offset + 1]);
    if (rainfall === null) continue;
    for (let bin = scale.length - 1; bin >= 0; bin--) {
      if (rainfall >= scale[bin].minimumMm) {
        rgba[pixel * 4] = colours[bin][0];
        rgba[pixel * 4 + 1] = colours[bin][1];
        rgba[pixel * 4 + 2] = colours[bin][2];
        rgba[pixel * 4 + 3] = 255;
        break;
      }
    }
  }
  return { width: png.width, height: png.height, rgba };
};

export const loadRainfallCanvas = async (
  url: string,
  signal: AbortSignal,
): Promise<HTMLCanvasElement> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Rainfall PNG request failed (${response.status}): ${url}`);
  }
  // Decode the compressed bytes directly: browser colour management must not
  // alter the packed high/low bytes before they become rainfall values.
  const { width, height, rgba } = colouriseRainfallPng(
    await response.arrayBuffer(),
  );
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Cannot create rainfall rendering canvas');
  const image = context.createImageData(width, height);
  image.data.set(rgba);
  context.putImageData(image, 0, 0);
  return canvas;
};
