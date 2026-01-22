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
//import missingDataImage from './no_satellites_64.png';
import OpenLayersMap from '../../mapping/OpenLayersMap';
//import lightningImage from './images/lightning_bolt_32_white.png';
import { Fill, Stroke } from 'ol/style';
import { ColorLike } from 'ol/colorlike';

const Picker = () => {
  /* currently handled in layerSelector
   */
  return null;
};

const Graphics = () => {
  const styles: { [key: string]: string[] } = {
    rainbow: [
      '#440154',
      '#460a5d',
      '#471365',
      '#481b6d',
      '#482374',
      '#472c7a',
      '#46337f',
      '#443a83',
      '#424186',
      '#3e4989',
      '#3c508b',
      '#39568c',
      '#365d8d',
      '#32648e',
      '#306a8e',
      '#2d708e',
      '#2b758e',
      '#287c8e',
      '#26828e',
      '#24878e',
      '#228d8d',
      '#20938c',
      '#1f998a',
      '#1f9f88',
      '#20a486',
      '#25ab82',
      '#2ab07f',
      '#32b67a',
      '#3bbb75',
      '#48c16e',
      '#54c568',
      '#60ca60',
      '#6ece58',
      '#7fd34e',
      '#8ed645',
      '#9dd93b',
      '#addc30',
      '#c0df25',
      '#d0e11c',
      '#dfe318',
      '#efe51c',
    ],
    rainbow_delme: [
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

  const layerId = useSelector(selectProfileLayerId);
  //const rdtLayerId = useSelector(selectProfileRdtId);
  //const lightningLayerId = useSelector(selectProfileLightningId);

  const layerCache = useSelector(selectCache);

  const [currentOlUid, setCurrentOlUid] = useState<string | null>(null);
  //const [currentOlUidRdt, setCurrentOlUidRdt] = useState<string | null>(null);
  //const [currentOlUidLi, setCurrentOlUidLi] = useState<string | null>(null);
  //const crrIsVisible = useSelector(selectCrrVisible);
  //const rdtIsVisible = useSelector(selectRdtVisible);
  //const opacityCRR = useSelector(selectOpacityCRR);
  //const opacityRDT = useSelector(selectOpacityRDT);
  //const opacityLightning = useSelector(selectOpacityLightning);
  //const products: FastaProduct[] = useSelector(selectFastaProducts);
  const invisibleStyle = (feature: any, resolution: any) => [];
  const currentStyle = useSelector(selectChosenStyle);

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

  function createStyleFunction(theme: string) {
    const tempArr = styles[theme];
    const styleArr = tempArr.map((hexVal) => {
      return createStyle(hexVal);
    });

    //const cnv = document.createElement('canvas');
    //const ctx = cnv.getContext('2d');
    //const img = new Image();
    //img.src = missingDataImage;
    //let pattern;
    //if (ctx) {
    //  pattern = ctx.createPattern(img, 'repeat');
    //}
    //const missingDataStyle = new Style({ fill: new Fill({ color: pattern }) });

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

  useEffect(() => {
    // get OL vector layers using layer cache and set / remove styling
    // for new and old layers

    //console.log("FastaGraphic crrLayerId: " + crrLayerId);

    const style = createStyleFunction(currentStyle);

    let newOlUid: string | null = null;

    let layer: Entry | null = null;
    if (layerId) {
      const id = layerId;
      layer = layerCache[layerId] as Entry;
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
      newLayer.setStyle(style);
    }
    newLayer?.setZIndex(5);

    setCurrentOlUid(newOlUid);
  }, [layerId, currentStyle]);

  /*
  useEffect(() => {
    // get OL vector layers using layer cache and set / remove styling
    // for new and old layers
    //

    //console.log("FastaGraphic rdtLayerId: " + rdtLayerId);

    const rdtStyles = createRdtStyleFunction(currentCrrStyle);

    let newOlUidRdt: string | null = null;

    let layer: Entry | null = null;
    if (rdtLayerId) {
      const layerId = rdtLayerId;
      layer = layerCache[rdtLayerId] as Entry;
    }
    if (layer) {
      newOlUidRdt = layer.ol_uid;
    }

    const oldLayer = getLayer(currentOlUidRdt);
    const newLayer = getLayer(newOlUidRdt);

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    if (newLayer) {
      if (rdtIsVisible) {
        newLayer.setVisible(true);
        newLayer.setStyle(rdtStyles);
      } else {
        newLayer.setVisible(false);
        newLayer.setStyle(invisibleStyle);
      }
    }

    newLayer?.setZIndex(5);
    setCurrentOlUidRdt(newOlUidRdt);
  }, [rdtLayerId, products, currentCrrStyle]);

  useEffect(() => {
    // Pre-load pattern on component mount
    const patternInfo = imagePatternManager.loadImagePattern(
      lightningImage,
      'lightning_bolt_white',
    );
  }, []);
*/

  /*
  useEffect(() => {
    // get OL vector layers using layer cache and set / remove styling
    // for new and old layers
    //

    const liStyle = createLightningPatternStyleFunction(lightningImage);

    let newOlUidLi: string | null = null;

    let layer: Entry | null = null;
    if (lightningLayerId) {
      const layerId = lightningLayerId;
      layer = layerCache[lightningLayerId] as Entry;
    }
    if (layer) {
      console.log('Got the layer');
      newOlUidLi = layer.ol_uid;
    }

    const oldLayer = getLayer(currentOlUidLi);
    const newLayer = getLayer(newOlUidLi);

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    if (newLayer) {
      console.log('Got newLayer');

      //  if (rdtIsVisible) {
      newLayer.setVisible(true);
      newLayer.setStyle(liStyle);
      //  } else {
      //    newLayer.setVisible(false);
      //    newLayer.setStyle(invisibleStyle);
      //  }
    }

    newLayer?.setZIndex(5);
    setCurrentOlUidLi(newOlUidLi);
  }, [lightningLayerId, products, currentCrrStyle]);
*/

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
