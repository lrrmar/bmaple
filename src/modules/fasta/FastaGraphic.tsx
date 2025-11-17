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
  selectProfileCrrId,
  selectProfileRdtId,
  selectProfileLightningId,
  selectFastaProducts,
  selectCrrVisible,
  selectRdtVisible,
  FastaProduct,
  selectOpacityCRR,
  selectOpacityRDT,
  selectOpacityLightning,
  selectCrrChosenStyle,
} from './fastaSlice';
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
import missingDataImage from './no_satellites_64.png';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import lightningImage from './images/lightning_bolt_32_white.png';
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
  const crrLayerId = useSelector(selectProfileCrrId);
  const rdtLayerId = useSelector(selectProfileRdtId);
  const lightningLayerId = useSelector(selectProfileLightningId);

  const layerCache = useSelector(selectCache);
  const [currentOlUidCrr, setCurrentOlUidCrr] = useState<string | null>(null);
  const [currentOlUidRdt, setCurrentOlUidRdt] = useState<string | null>(null);
  const [currentOlUidLi, setCurrentOlUidLi] = useState<string | null>(null);
  const crrIsVisible = useSelector(selectCrrVisible);
  const rdtIsVisible = useSelector(selectRdtVisible);
  const opacityCRR = useSelector(selectOpacityCRR);
  const opacityRDT = useSelector(selectOpacityRDT);
  const opacityLightning = useSelector(selectOpacityLightning);
  const products: FastaProduct[] = useSelector(selectFastaProducts);
  const invisibleStyle = (feature: any, resolution: any) => [];
  const currentCrrStyle = useSelector(selectCrrChosenStyle);
  const getLayer = (
    uid: string | null,
  ): VectorTileLayer<Feature<Geometry>> | null => {
    let baseLayer: BaseLayer | undefined = undefined;
    let vectorTileLayer: VectorTileLayer<Feature<Geometry>> | null = null;

    map
      .getLayers()
      .getArray()
      .forEach((l) => {
        if (getUid(l) === uid) {
          baseLayer = l;
        }
      });

    if (baseLayer) {
      vectorTileLayer = baseLayer as VectorTileLayer<Feature<Geometry>>;
    }
    return vectorTileLayer;
  };

  function createStyle(hexVal: string) {
    return new Style({ fill: new Fill({ color: hexVal }) });
  }

  function createCrrStyleFunction(theme: string) {
    const tempArr = styles[theme];
    const styleArr = tempArr.map((hexVal) => {
      return createStyle(hexVal);
    });
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    const img = new Image();
    img.src = missingDataImage;
    let pattern;
    if (ctx) {
      pattern = ctx.createPattern(img, 'repeat');
    }
    const missingDataStyle = new Style({ fill: new Fill({ color: pattern }) });
    const crrArr = [
      'CRR_02_1',
      'CRR_1_2',
      'CRR_2_3',
      'CRR_3_5',
      'CRR_5_7',
      'CRR_7_10',
      'CRR_10_15',
      'CRR_15_20',
      'CRR_20_30',
      'CRR_30_50',
      'CRR_50_plus',
    ];

    return (feature: FeatureLike) => {
      const objectType = feature.get('object_type');
      if (objectType === 'CRR-missing-data') {
        return missingDataStyle;
      } else {
        const rate = feature.get('rain_rate');
        const index = crrArr.findIndex((x) => {
          return x === rate;
        });
        if (index === -1) {
          return styleArr[styleArr.length - 1];
        } else {
          return styleArr[index];
        }
      }
    };
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

  // For Fill Pattern caching

  interface PatternInfo {
    pattern: CanvasPattern | null;
    ready: boolean;
  }

  interface PatternConfig {
    imageUrl: string;
    scale?: number;
    fallbackColor?: string;
  }

  class ImagePatternManager {
    private patternCache: Map<string, PatternInfo>;

    constructor() {
      this.patternCache = new Map();
    }

    public loadImagePattern(imageUrl: string, scale = 1): PatternInfo {
      const cacheKey = `${imageUrl}_${scale}`;
      const cached = this.patternCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const patternInfo: PatternInfo = {
        pattern: null,
        ready: false,
      };
      this.patternCache.set(cacheKey, patternInfo);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      img.onload = (): void => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error('Failed to get canvas context');
          patternInfo.ready = true;
          return;
        }

        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pattern = ctx.createPattern(canvas, 'repeat');

        if (pattern) {
          patternInfo.pattern = pattern;
        }
        patternInfo.ready = true;
      };

      img.onerror = (): void => {
        console.error(`Failed to load pattern image: ${imageUrl}`);
        patternInfo.ready = true;
      };

      return patternInfo;
    }

    public createPatternStyleFunction(theme: string) {
      const patternInfo = this.loadImagePattern(lightningImage);

      return (feature: FeatureLike): Style => {
        if (patternInfo.ready && patternInfo.pattern) {
          return new Style({
            fill: new Fill({
              color: patternInfo.pattern as ColorLike,
            }),
            // IF border required:
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 1,
            }),
          });
        } else {
          return new Style({
            fill: new Fill({
              color: 'rgba(200, 200, 200, 0.5)',
            }),
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 1,
            }),
          });
        }
      };
    }

    public preloadPatterns(patternConfigs: PatternConfig[]): void {
      patternConfigs.forEach((config) => {
        this.loadImagePattern(config.imageUrl, config.scale || 1);
      });
    }

    public isPatternReady(imageUrl: string, scale = 1): boolean {
      const cacheKey = `${imageUrl}_${scale}`;
      const patternInfo = this.patternCache.get(cacheKey);
      return patternInfo ? patternInfo.ready : false;
    }

    public clearCache(): void {
      this.patternCache.clear();
    }

    public getCacheSize(): number {
      return this.patternCache.size;
    }
  }

  function createLightningStyleFunction2(theme: string) {
    //const hexColour = styles[theme][10];
    let pattern: CanvasPattern | null = null;
    let patternReady = false;

    // Preload the image and create pattern
    const img = new Image();
    img.src = lightningImage;
    img.onload = () => {
      pattern = createPatternFromImage(img);
      patternReady = true;
    };

    // Function to create pattern from loaded image
    const createPatternFromImage = (image: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Use the image's natural dimensions
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      if (ctx == null) {
        return null;
      }
      ctx.drawImage(image, 0, 0);
      return ctx.createPattern(canvas, 'repeat');
    };

    // Return style function
    return (feature: FeatureLike) => {
      if (patternReady) {
        return new Style({
          fill: new Fill({
            color: pattern,
          }),
          stroke: new Stroke({
            color: '#333333',
            width: 1,
          }),
        });
      } else {
        // Fallback style while image loads
        return new Style({
          fill: new Fill({
            color: 'rgba(200, 200, 200, 0.5)',
          }),
          stroke: new Stroke({
            color: '#333333',
            width: 1,
          }),
        });
      }
    };
  }

  /*
    const styleFunction = (feature: FeatureLike) => {
      const patternImage = new Image();

      const hexColour = '#332288';
      const fillStyleX = new Style({
        //fill: new Fill({ color: '#cccccc' }),
        fill: new Fill({ pattern: patternImage }),
      });
      return [fillStyleX];
    };
*/

  //    return styleFunction;
  //  }

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */

    //console.log("FastaGraphic crrLayerId: " + crrLayerId);

    const crrStyle = createCrrStyleFunction(currentCrrStyle);

    let newOlUidCrr: string | null = null;

    let layer: Entry | null = null;
    if (crrLayerId) {
      const layerId = crrLayerId;
      layer = layerCache[crrLayerId] as Entry;
    }

    if (layer) {
      newOlUidCrr = layer.ol_uid;
    }

    //console.log("FastaGraphic newOlUidCrr: " + newOlUidCrr);

    const oldLayer = getLayer(currentOlUidCrr);
    const newLayer = getLayer(newOlUidCrr);

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    if (newLayer) {
      if (crrIsVisible) {
        newLayer.setVisible(true);
        newLayer.setStyle(crrStyle);
      } else {
        newLayer.setVisible(false);
        newLayer.setStyle(invisibleStyle);
      }
    }
    newLayer?.setZIndex(5);
    setCurrentOlUidCrr(newOlUidCrr);
  }, [crrLayerId, products, currentCrrStyle]);

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */

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
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */

    console.log('FastaGraphic liLayerId: ' + lightningLayerId);

    const patternManager = new ImagePatternManager();

    //const liStyle = createLightningStyleFunction(currentCrrStyle);
    const liStyle = patternManager.createPatternStyleFunction(lightningImage);

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

  // set opacity
  useEffect(() => {
    let olLayer: VectorLayer<Feature> | undefined;
    const mapUtils = new OpenLayersMap();
    products.forEach((p) => {
      let id: string | null;
      let opacity: number;

      console.log('SET OPACITY ' + p.name);

      if (p.name === 'CRR') {
        id = crrLayerId;
        opacity = opacityCRR;
      } else if (p.name === 'RDT') {
        id = rdtLayerId;
        opacity = opacityRDT;
      } else if (p.name === 'LI') {
        console.log('SET LIGHT OPACITY TO: ' + opacityLightning);
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

  return <div className="FastaGraphics"></div>;
};

const FastaGraphic = () => {
  const [displayedLayer, setDisplayedLayer] = useState(null);
  const map = openLayersMap.map;
  return (
    <div className="FastaGraphic">
      {/*<Picker />*/}
      <Graphics />
      {/*<Behaviours />*/}
    </div>
  );
};

export default FastaGraphic;
