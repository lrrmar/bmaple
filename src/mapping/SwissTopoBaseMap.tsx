import React, { useEffect } from 'react';
import OLTileLayer from 'ol/layer/Tile';
import * as olSource from 'ol/source';
import openLayersMap from './OpenLayersMap';

const SwissTopoBaseMap = ({ id }: { id: string }) => {
  const map = openLayersMap.map;

  useEffect(() => {
    if (!map) return;
    const tileLayer = new OLTileLayer({
      source: new olSource.XYZ({
        url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`,
      }),
      zIndex: 0,
    });
    map.addLayer(tileLayer);
  }, []);

  return <div></div>;
};

export default SwissTopoBaseMap;
