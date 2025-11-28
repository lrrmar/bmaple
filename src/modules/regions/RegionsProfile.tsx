import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, isEntry } from '../../mapping/cacheSlice';
import { selectCurrentLayerName, selectOpacity } from './regionsSlice';
import { isEntryRegions } from './RegionsLayer';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import {Style, Stroke, Fill} from 'ol/style';

import { selectVerticalLevel } from '../../mapping/mapSlice';

const RegionsProfile = () => {
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const verticalLevel = useSelector(selectVerticalLevel);
  const loaded = useRef<boolean>(false);

  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [displayedIds, setDisplayedIds] = useState<string[]>([]);

  useEffect(() => {

    if (loaded.current) return;
    const ids = Object.keys(cache).filter((id) => id.includes('nats-danger'));
    console.log(ids)
    ids.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setStyle(new Style({
          stroke: new Stroke({
            color: 'rgba(255,255,0,1)',
            width: 0.7,
          }),
          fill: new Fill({
            color: 'rgba(255,255,0,0.1)',
          })
        }));
      }
    });
  }, [verticalLevel]);

  useEffect(() => {
    const filteredByAltitude = Object.values(cache).filter((c) => {
      const lower = c['lower limit'];
      const upper = c['upper limit'];
      if (lower !== null && lower !== undefined && upper && verticalLevel) {
        return lower <= verticalLevel && verticalLevel <= upper;
      } else {
      }
      return false;
    });
    const filteredByAltitudeIds = filteredByAltitude.map((a) => a.id);
    setFilteredIds(filteredByAltitudeIds);
  }, [verticalLevel]);

  useEffect(() => {
    // When currentLayerName changes, set layers with ids in displayedIds to be invisible and currentLayerName to be visible

    displayedIds.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setVisible(false);
      }
    });

    filteredIds.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setVisible(true);
      }
    });
    setDisplayedIds(filteredIds);
  }, [filteredIds, cache]);

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
