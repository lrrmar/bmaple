import { Fill, Stroke, Style } from 'ol/style';

function getVectorStyle(level: string, palette: { [key: string]: string }) {
  const style = new Style({
    stroke: new Stroke({
      color: palette[level],
      width: 1,
    }),
    fill: new Fill({
      color: palette[level],
    }),
  });

  return style;
}
export default getVectorStyle;
