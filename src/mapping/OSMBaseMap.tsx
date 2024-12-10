import React, { useEffect } from 'react';
import OLTileLayer from 'ol/layer/Tile';
import * as olSource from 'ol/source';
import OSM from 'ol/source/OSM';
import openLayersMap from './OpenLayersMap';

const OSMBaseMap = ({ id }: { id: string }) => {
  const map = openLayersMap.map;

  useEffect(() => {
    if (!map) return;
    const tileLayer = new OLTileLayer({
      source: new OSM(),
      zIndex: 0,
    });
    map.addLayer(tileLayer);
  }, []);

  return <div></div>;
};

export default OSMBaseMap;
