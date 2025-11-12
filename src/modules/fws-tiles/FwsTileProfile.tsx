import React, { useState, useEffect } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, isEntry } from '../../mapping/cacheSlice';
//import { isEntryBGSWMS } from './bgsWmsLayer';
import { selectProfileIds, selectOpacity } from './fwsTileSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import VectorLayer from 'ol/layer/Vector';
import { FeatureLike } from 'ol/Feature';
import { Feature } from 'ol';
import getVectorStyle from './Styles';
import colourPalettes from './colourPalettes';

const FwsTileProfile = () => {
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  //const currentLayerName = useSelector(selectCurrentLayerName);
  const profileIds = useSelector(selectProfileIds);
  const numLevels = 16; // TEMPORARY
  const colourPaletteName = 'tol'; // TEMPORARY

  const [displayedIds, setDisplayedIds] = useState<string[]>([]);

  const applyStyle = (feature: FeatureLike) => {
    const colours = colourPalettes[colourPaletteName](numLevels);
    const palette: { [key: string]: string } = {};
    colours.forEach((colour, i) => {
      palette[`${i}`] = colour;
    });
    const level = feature.get('level');
    return getVectorStyle(level, palette, false);
  };

  useEffect(() => {
    // When currentLayerName changes, set layers with ids in displayedIds to be invisible and currentLayerName to be visible

    displayedIds.forEach((id) => {
      if (id) {
        const element = cache[id];
        if (element && isEntry(element)) {
          const mapUtils = new OpenLayersMap();
          let olLayer: VectorLayer<Feature> | undefined;
          const ol_uid = element.ol_uid;
          if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
          if (olLayer) {
            olLayer.setVisible(false);
            olLayer.setStyle(applyStyle);
          }
        }
      }
    });

    const toDisplayIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      //if (isEntryBGSWMS(element)) {
      return Object.values(profileIds).includes(element.id);
      //}
    });

    toDisplayIds.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setVisible(true);
      }
    });
    setDisplayedIds(toDisplayIds);
  }, [profileIds, cache]);

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

export default FwsTileProfile;
