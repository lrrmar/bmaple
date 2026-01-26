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

import { selectProfileLayerId, selectChosenStyle } from './cumulusSlice';
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
import { FeatureLike } from 'ol/Feature';
import { FlatStyleLike } from 'ol/style/flat';
import VectorLayer from 'ol/layer/Vector';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { Fill, Stroke } from 'ol/style';
import { ColorLike } from 'ol/colorlike';
import OnsetDayOfYearLegendData from './OnsetDayOfYearLegendData';
import OnsetRainDaysAgoLegendData from './OnsetRainDaysAgoLegendData';

const Picker = () => {
  /* currently handled in layerSelector
   */
  return null;
};

const Graphics = () => {
  const map = openLayersMap.map;

  const layerId = useSelector(selectProfileLayerId);
  const layerCache = useSelector(selectCache);

  const [currentOlUid, setCurrentOlUid] = useState<string | null>(null);
  //const products: FastaProduct[] = useSelector(selectFastaProducts);
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

  function createStyle(hexVal: string) {
    return new Style({ fill: new Fill({ color: hexVal }) });
  }

  // Define TypeScript interfaces for your GeoJSON structure
  interface GeoJSONProperties {
    ObjectType: string;
    level: number;
    level_value: string;
    threshold: number;
  }

  function createEmptyStyleFunction() {
    return (feature: FeatureLike) => {
      return new Style({});
    };
  }

  function createStyleFunction(hexColours: string[]) {
    const styleArr = hexColours.map((hexVal) => {
      return createStyle(hexVal);
    });

    return (feature: FeatureLike) => {
      const properties = feature.getProperties() as GeoJSONProperties;

      // Check if this is a contour feature
      if (properties.ObjectType !== 'data-contour') {
        return new Style({}); // Return empty style for non-contour features
      }

      // Get the level from properties
      const level = properties.level;

      // Get color from palette, default to gray if not found
      return styleArr[level];
    };
  }

  function createDayOfYearStyleFunction() {
    const legendData = OnsetDayOfYearLegendData.getInstance();
    return createStyleFunction(legendData.getColorsArray());
  }

  function createRainDaysAgoStyleFunction() {
    const legendData = OnsetRainDaysAgoLegendData.getInstance();
    return createStyleFunction(legendData.getColorsArray());
  }

  useEffect(() => {
    // get OL vector layers using layer cache and set / remove styling
    // for new and old layers

    let styleFn: (feature: FeatureLike) => Style;
    styleFn = createEmptyStyleFunction();

    let newOlUid: string | null = null;

    let layer: Entry | null = null;
    if (layerId) {
      const id = layerId;
      layer = layerCache[layerId] as Entry;
      console.log('CumulusGraphic: found layer in cache for id: ' + id);
      if (id.startsWith('days')) {
        console.log('CumulusGraphic: using Rain Days Ago style function');
        styleFn = createRainDaysAgoStyleFunction();
      } else if (id.startsWith('doy')) {
        console.log('CumulusGraphic: using Day of Year style function');
        styleFn = createDayOfYearStyleFunction();
      }
    }

    if (layer) {
      newOlUid = layer.ol_uid;
    }

    console.log('Graphic currentOlUidCrr: ' + currentOlUid);
    console.log('Graphic newOlUidCrr: ' + newOlUid);

    const oldLayer = getLayer(currentOlUid);
    const newLayer = getLayer(newOlUid);

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    if (newLayer) {
      newLayer.setVisible(true);
      newLayer.setStyle(styleFn);
    }
    newLayer?.setZIndex(5);

    setCurrentOlUid(newOlUid);
  }, [layerId]);

  /*
  // set opacity
  useEffect(() => {
    let olLayer: VectorLayer<Feature> | undefined;
    const mapUtils = new OpenLayersMap();
    products.forEach((p) => {
      let id: string | null;
      let opacity: number;

      if (p.name === 'CRR') {
        id = crrLayerId;
        opacity = opacityCRR;
      } else if (p.name === 'RDT') {
        id = rdtLayerId;
        opacity = opacityRDT;
      } else if (p.name === 'LI') {
        id = lightningLayerId;
        opacity = opacityLightning;
      } else {
        return;
      }

      if (id) {
        const layer = layerCache[id];
        if (layer && isEntry(layer)) {
          const ol_uid = layer.ol_uid;
          if (ol_uid) {
            olLayer = mapUtils.getLayerByUid(ol_uid);
          }
          if (olLayer) {
            olLayer.setZIndex(5);
            olLayer.setOpacity(opacity);
          }
        }
      }
    });
  }, [
    crrLayerId,
    rdtLayerId,
    lightningLayerId,
    opacityCRR,
    opacityRDT,
    opacityLightning,
  ]);
*/

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
