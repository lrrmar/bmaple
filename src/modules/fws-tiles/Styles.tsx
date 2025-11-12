import { Fill, Stroke, Style } from 'ol/style';

function getVectorStyle(
  level: string,
  palette: { [key: string]: string },
  outlineContours: boolean,
) {
  const strokeColour = outlineContours ? '#000000' : palette[level];
  const style = new Style({
    stroke: new Stroke({
      color: strokeColour,
      width: 0.5,
    }),
    fill: new Fill({
      color: palette[level],
    }),
  });

  return style;
}
export default getVectorStyle;
