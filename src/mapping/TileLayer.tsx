import React, { useEffect } from 'react';
import OLTileLayer from 'ol/layer/Tile';
import * as olSource from 'ol/source';

import openLayersMap from './OpenLayersMap';

const TileLayer = () => {
  const map = openLayersMap.map;

  useEffect(() => {
    if (!map) return;
    const tileLayer = new OLTileLayer({
      source: new olSource.XYZ({
        url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      }),
      zIndex: 0,
    });
    map.addLayer(tileLayer);
  }, []);

  return <div></div>;
};

export default TileLayer;
