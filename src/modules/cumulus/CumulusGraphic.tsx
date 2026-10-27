import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { getUid } from 'ol/util';

import {
  selectProfileLayerId,
  selectChosenStyle,
  selectOverlayOpacity,
} from './cumulusSlice';
import { Entry, isEntry, selectCache } from '../../mapping/cacheSlice';

import openLayersMap from '../../mapping/OpenLayersMap';
import BaseLayer from 'ol/layer/Base.js';
import Style, { StyleLike } from 'ol/style/Style.js';
import { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import OpenLayersMap from '../../mapping/OpenLayersMap';

const Picker = () => {
  /* currently handled in layerSelector
   */
  return null;
};

const Graphics = () => {
  const map = openLayersMap.map;

  const layerId = useSelector(selectProfileLayerId);
  const layerCache = useSelector(selectCache);
  const overlayOpacity = useSelector(selectOverlayOpacity);

  const invisibleStyle = (feature: any, resolution: any) => [];

  const getLayer = (
    uid: string | null,
  ): VectorLayer<Feature<Geometry>> | null => {
    let baseLayer: BaseLayer | undefined = undefined;
    let vectorLayer: VectorLayer<Feature<Geometry>> | null = null;

    map
      .getLayers()
      .getArray()
      .forEach((l) => {
        if (getUid(l) === uid) {
          baseLayer = l;
        }
      });

    if (baseLayer) {
      vectorLayer = baseLayer as VectorLayer<Feature<Geometry>>;
    }
    return vectorLayer;
  };

  function createEmptyStyleFunction() {
    return (feature: FeatureLike) => {
      return new Style({});
    };
  }

  useEffect(() => {
    // Show exactly one cumulus layer (the selected one) and hide all others.
    // Derived from the cache on every change, so it is safe to re-run and
    // corrects any layer that was missed earlier.
    const selected = layerId ? layerCache[layerId] : undefined;
    const selectedUid =
      selected && isEntry(selected) ? (selected as Entry).ol_uid : null;

    Object.values(layerCache).forEach((element) => {
      if (!isEntry(element) || element.source !== 'cumulus') return;
      const layer = getLayer(element.ol_uid);
      if (!layer) return;

      if (element.ol_uid === selectedUid) {
        layer.setVisible(true);
        layer.setOpacity(overlayOpacity);
        layer.setZIndex(5);
      } else {
        layer.setVisible(false);
        layer.setOpacity(0);
      }
    });
  }, [layerId, layerCache, overlayOpacity]);

  return <div className="FastaGraphics"></div>;
};

const CumulusGraphic = () => {
  const [displayedLayer, setDisplayedLayer] = useState(null);
  const map = openLayersMap.map;
  return (
    <div className="CumulusGraphic">
      {/*<Picker />*/}
      <Graphics />
      {/*<Behaviours />*/}
    </div>
  );
};

export default CumulusGraphic;
