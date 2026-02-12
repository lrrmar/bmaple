import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache } from '../../mapping/cacheSlice';
import { selectHighlightedRoutines } from './sortieSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';

import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';

const TrackProfile = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const highlightedRoutines = useSelector(selectHighlightedRoutines);

  useEffect(() => {
    if (map) {
      const filteredIds = Object.keys(cache).filter((id) => {
        const element = cache[id];
        const source = element.source;
        return source === sourceIdentifier;
      });
      const layer = map.get(sourceIdentifier +'-layer');
      filteredIds.forEach((id) => {
        const color = highlightedRoutines.includes(id) ? '#afa0ff': '#f0a040' 
        const feature =  map.get(id);
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
          )
        }
      })
    }
  }, [cache, highlightedRoutines])

  return <div></div>;
}

export default TrackProfile;
