import { Fill, Stroke, Style } from 'ol/style';

function getVectorStyle(
  level: string,
  palette: { [key: string]: string },
  strokeColour: string,
  strokeWidth: number,
) {
  const style = new Style({
    stroke: new Stroke({
      color: strokeColour,
      width: strokeWidth,
    }),
    fill: new Fill({
      color: palette[level],
    }),
  });

  return style;
}
export default getVectorStyle;
