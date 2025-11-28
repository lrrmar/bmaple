import React, { useState, useEffect } from 'react';
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

import { selectVerticalLevel } from '../../mapping/mapSlice';

const RegionsProfile = ({ sourceIdentifier }) => {
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const verticalLevel = useSelector(selectVerticalLevel);

  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [displayedIds, setDisplayedIds] = useState<string[]>([]);

  useEffect(() => {
    const filteredByAltitude = Object.values(cache).filter((c) => {
      const lower = c['lower limit'];
      const upper = c['upper limit'];
      if (lower !== null && lower !==undefined && upper && verticalLevel) {
        return lower <= verticalLevel && verticalLevel <= upper;
      } else {
        console.log(c.name, lower, upper)
      }
      return false;
    });
    console.log(verticalLevel);
    console.log(filteredByAltitude.map((a) => a.name));
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
