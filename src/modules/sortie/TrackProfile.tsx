import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache } from '../../mapping/cacheSlice';
import { selectHighlightedFeatures, selectAppStyle } from './sortieSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';

import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';

import Map from 'ol/Map';

const TrackProfile = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
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
        const color = !highlightedFeatures.includes(id)
          ? appStyle.secondaryColor
          : appStyle.primaryColor;
        const feature = map.get(id);
        if (feature) {
          feature.setStyle(
            new Style({
              stroke: new Stroke({
                color: color,
                width: 4,
                lineCap: 'round',
                lineJoin: 'round',
              }),
            }),
          );
        }
      });
    }
  }, [cache, highlightedFeatures]);

  return <div></div>;
};

export default TrackProfile;
