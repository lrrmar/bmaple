import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, isEntry } from '../../mapping/cacheSlice';
import {
  selectCurrentLayerName,
  selectOpacity,
  selectVisible,
} from './regionsSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { Style, Stroke, Fill } from 'ol/style';
import Map from 'ol/Map';

import { selectVerticalLevel } from '../../mapping/mapSlice';

const RegionsProfile = () => {
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const visible = useSelector(selectVisible);
  const verticalLevel = useSelector(selectVerticalLevel);
  const loaded = useRef<boolean>(false);

  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [displayedIds, setDisplayedIds] = useState<string[]>([]);

  useEffect(() => {
    const ids = Object.keys(cache).filter((id) => id.includes('nats-danger'));
    let filtered: string[];
    if (visible) {
      filtered = ids.filter((id) => {
        const c = cache[id];
        const lower = c['lower limit'];
        const upper = c['upper limit'];
        if (lower !== null && lower !== undefined && upper && verticalLevel) {
          return lower <= verticalLevel && verticalLevel <= upper;
        } else {
          return false;
        }
      });
    } else {
      filtered = [];
    }
    setFilteredIds(filtered);
  }, [verticalLevel, visible]);

  useEffect(() => {
    // When currentLayerName changes, set layers with ids in displayedIds to be invisible and currentLayerName to be visible

    if (map) {
      displayedIds.forEach((id) => {
        const feature = map.get(id);
        if (feature) {
          feature.setStyle(new Style({}));
        }
      });

      filteredIds.forEach((id) => {
        const feature = map.get(id);
        if (feature) {
          feature.setStyle(
            new Style({
              stroke: new Stroke({
                width: 0.01,
              }),
              fill: new Fill({
                color: 'rgba(10,10,10, 0.25)',
              }),
            }),
          );
        }
      });
      setDisplayedIds(filteredIds);
    }
  }, [filteredIds]);

  useEffect(() => {
    // When opacity changes, change corresponding layers

    displayedIds.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setOpacity(opacity);
      }
    });
  }, [opacity, displayedIds]);

  return <div></div>;
};

export default RegionsProfile;
