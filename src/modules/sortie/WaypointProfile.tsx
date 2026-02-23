import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache } from '../../mapping/cacheSlice';
import {
  selectActiveWaypoints,
  selectHighlightedFeatures,
  selectAppStyle,
} from './sortieSlice';

import OpenLayersMap from '../../mapping/OpenLayersMap';
import Map from 'ol/Map';

import Icon from 'ol/style/Icon.js';
import Style from 'ol/style/Style.js';

const WaypointProfile = ({
  sourceIdentifier,
}: {
  sourceIdentifier: string;
}) => {
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const activeWaypoints = useSelector(selectActiveWaypoints);
  const highlightedFeatures = useSelector(selectHighlightedFeatures);
  const appStyle = useSelector(selectAppStyle);

  useEffect(() => {
    if (map) {
      const filteredIds = Object.keys(cache).filter((id) => {
        const element = cache[id];
        const source = element.source;
        return source === sourceIdentifier;
      });
      filteredIds.forEach((id) => {
        const text = id.split('-')[1];
        let primaryColour: string;
        let secondaryColour: string;

        if (highlightedFeatures.includes(text)) {
          primaryColour = appStyle.secondaryColor;
          secondaryColour = 'rgba(255,255,255,0.9)';
        } else if (activeWaypoints.includes(text)) {
          primaryColour = appStyle.primaryColor;
          secondaryColour = 'rgba(255,255,255,0.9)';
        } else {
          primaryColour = 'rgba(255,255,255,0.9)';
          secondaryColour = appStyle.primaryColor;
        }
        const flag = WaypointFlag(text, primaryColour, secondaryColour);
        const feature = map.get(id);
        if (feature) {
          feature.setStyle(
            new Style({
              image: new Icon({
                img: flag,
                size: [flag.width, flag.height],
                anchor: [0, 1],
              }),
            }),
          );
        }
      });
    }
  }, [cache, activeWaypoints, highlightedFeatures]);

  return <div></div>;
};

const WaypointFlag = (
  text: string,
  primaryColour: string,
  secondaryColour: string,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 20;

  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.save();
    ctx.strokeStyle = primaryColour;
    ctx.fillStyle = primaryColour;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.height * 0.25, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width - canvas.height * 0.125, canvas.height * 0.51);
    ctx.lineTo(canvas.height * 0.125, canvas.height * 0.5);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.fillStyle = secondaryColour;
    ctx.strokeStyle = secondaryColour;
    ctx.fillText(text, canvas.height * 0.5, canvas.height * 0.5);

    ctx.restore();
  }

  return canvas;
};
export default WaypointProfile;
