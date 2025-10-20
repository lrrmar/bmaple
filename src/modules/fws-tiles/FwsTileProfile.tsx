import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
//import OLVectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import GeoJSON from 'ol/format/GeoJSON';
import { Raster, Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { getUid } from 'ol/util';
import { get } from 'ol/proj';
import {
  selectProfileIds,
} from './fwsTileSlice';
import {
  Entry,
  Ingest,
  isEntry,
  request,
  Request,
  selectCache,
} from '../../mapping/cacheSlice';

import openLayersMap from '../../mapping/OpenLayersMap';
import BaseLayer from 'ol/layer/Base.js';
import Style, { StyleLike } from 'ol/style/Style.js';
import Fill from 'ol/style/Fill';
import { FeatureLike } from 'ol/Feature';
import { FlatStyleLike } from 'ol/style/flat';
import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import OpenLayersMap from '../../mapping/OpenLayersMap';

const Picker = () => {
  /* currently handled in layerSelector
   */
  return null;
};

const Graphics = () => {
  const styles: { [key: string]: string[] } = {
    rainbow: [
      '#2579d4',
      '#2a8cf0',
      '#1cd0f5',
      '#428730',
      '#31c749',
      '#63dd54',
      '#f9e063',
      '#fbc65b',
      '#fb8349',
      '#fd5740',
      '#b31b27',
      '#000',
    ],
    tol: [
      '#332288',
      '#117733',
      '#44AA99',
      '#88CCEE',
      '#DDCC77',
      '#DDCC77',
      '#AA4499',
      '#882255',
      '#5EF042',
      '#AA0495',
      '#DA857C',
      '#3ACB09',
    ],
    viridis: [
      '#fde725',
      '#c2df23',
      '#86d549',
      '#52c569',
      '#2ab07f',
      '#1e9b8a',
      '#25858e',
      '#2d708e',
      '#38588c',
      '#433e85',
      '#482173',
      '#440154',
    ],
  };
  const map = openLayersMap.map;
  const profileIds = useSelector(selectProfileIds);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const layerCache = useSelector(selectCache);
  const invisibleStyle = (feature: any, resolution: any) => [];

  function createStyle(hexVal: string) {
    return new Style({ fill: new Fill({ color: hexVal }) });
  }

  function createRdtStyleFunction(theme: string) {
    const hexColour = styles[theme][10];
    const fillStyleCell000 = new Style({
      fill: new Fill({ color: hexColour + '66' }),
    }); // red, semi-transparent
    const fillFallback = new Style({ fill: new Fill({ color: '#ccc' }) });

    const lineStyleCell000 = new Style({
      stroke: new Stroke({ color: hexColour + 'E6', width: 1 }),
    }); // red
    const lineStyleForecast = new Style({
      stroke: new Stroke({ color: '#000000', width: 2 }),
    });
    const lineStylePast = new Style({
      stroke: new Stroke({ color: '#666666', width: 2 }),
    });
    const lineFallback = new Style({
      stroke: new Stroke({ color: '#ccc', width: 0 }),
    });

    const styleFunction = (feature: FeatureLike) => {
      let fillStyle: Style;
      let lineStyle: Style;

      const objectType = feature.get('object_type');

      if (objectType === 'cell-000') {
        fillStyle = fillStyleCell000;
      } else {
        fillStyle = fillFallback;
      }

      if (objectType === 'cell-000') {
        lineStyle = lineStyleCell000;
      } else if (objectType === 'FcstCGTraj') {
        lineStyle = lineStyleForecast;
      } else if (objectType === 'PastCGTraj') {
        lineStyle = lineStylePast;
      } else {
        lineStyle = lineFallback;
      }

      return [fillStyle, lineStyle];
    };

    return styleFunction;
  }

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */

    //console.log("FwsTileProfile profileId: " + profileId);

    //const crrStyle = createCrrStyleFunction(currentCrrStyle);

    let newUid: string | null = null;

    let layer: Entry | null = null;
    const profileId = profileIds[0];
    if (profileId) {
      const layerId = profileId;
      layer = layerCache[profileId] as Entry;
    }

    if (layer) {
      newUid= layer.ol_uid;
    }

    //console.log("FwsTileProfile newOlUidCrr: " + newOlUidCrr);
    const mapUtils = new OpenLayersMap();

    console.log(currentUid, newUid);
    let oldLayer = null;
    let newLayer = null;
    if (currentUid) {
      oldLayer = mapUtils.getLayerByUid(currentUid);
      if (oldLayer) {
        oldLayer.setVisible(false);
        oldLayer.setStyle(invisibleStyle);
      }
    }
    if (newUid) {
      newLayer = mapUtils.getLayerByUid(newUid);
      if (newLayer) {
        newLayer.setVisible(true);
        newLayer.setStyle(crrStyle);
      }
    }
    //newLayer?.setZIndex(5);
    setCurrentUid(newUid);
  }, [profileIds]);


  return <div className="FwsTileProfiles"></div>;
};

const FwsTileProfile = () => {
  const [displayedLayer, setDisplayedLayer] = useState(null);
  const map = openLayersMap.map;
  return (
    <div className="FwsTileProfile">
      {/*<Picker />*/}
      <Graphics />
      {/*<Behaviours />*/}
    </div>
  );
};

export default FwsTileProfile;
