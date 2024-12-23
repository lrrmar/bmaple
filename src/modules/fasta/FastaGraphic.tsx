import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
//import OLVectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { getUid } from 'ol/util';
import { get } from 'ol/proj';
import {
  selectProfileCrrId,
  selectProfileRdtId,
  selectFastaProducts,
  FastaProduct,
} from './fastaSlice';
import { Entry, request, Request, selectCache } from '../../mapping/cacheSlice';

import openLayersMap from '../../mapping/OpenLayersMap';
import BaseLayer from 'ol/layer/Base.js';
import Style, { StyleLike } from 'ol/style/Style.js';
import Fill from 'ol/style/Fill';
import { FeatureLike } from 'ol/Feature';
import { FlatStyleLike } from 'ol/style/flat';
import Stroke from 'ol/style/Stroke';

const Picker = () => {
  /* currently handled in layerSelector
   */
  return null;
};

const Graphics = () => {
  const map = openLayersMap.map;
  const crrLayerId = useSelector(selectProfileCrrId);
  const rdtLayerId = useSelector(selectProfileRdtId);
  const layerCache = useSelector(selectCache);
  const [currentOlUidCrr, setCurrentOlUidCrr] = useState<string|null>(null);
  const [currentOlUidRdt, setCurrentOlUidRdt] = useState<string|null>(null);
  const products : FastaProduct[] = useSelector(selectFastaProducts);
  const invisibleStyle = (feature: any, resolution: any) => [];


  const getLayer = (
    uid: string|null) : VectorTileLayer<Feature<Geometry>>|null => {
    
    var baseLayer: BaseLayer|undefined = undefined;
    var vectorTileLayer : VectorTileLayer<Feature<Geometry>>|null = null;

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
  }

  const showHideLayers = (
    newOlUid: string|null,
    currentOlUid: string|null,
    isProductVisible: boolean,
    layerStyle: StyleLike | FlatStyleLike | null | undefined,
    layerOpacity: number|null) : VectorTileLayer<Feature<Geometry>>|null => {
    
    const invisibleStyle = (feature: any, resolution: any) => [];

    var newBaseLayer: BaseLayer|undefined = undefined;
    var oldBaseLayer: BaseLayer|undefined = undefined;

    var newLayer : VectorTileLayer<Feature<Geometry>>|null = null;

    map
      .getLayers()
      .getArray()
      .forEach((l) => {
        //if (l.ol_uid === newOlUid) {
        if (getUid(l) === newOlUid) {
          newBaseLayer = l;
        }
        if (getUid(l) === currentOlUid) {
          oldBaseLayer = l;
        }
      });

    if (oldBaseLayer) {
      var oldLayer = oldBaseLayer as VectorTileLayer<Feature<Geometry>>;
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }
  
    if (newBaseLayer) {
      
      newLayer = newBaseLayer as VectorTileLayer<Feature<Geometry>>;

      if (!newLayer) {
        return null;
      }

      if (!isProductVisible) {
        newLayer.setVisible(false);
        newLayer.setStyle(invisibleStyle);
        return null;
      }

      newLayer.setVisible(true);
      newLayer.setStyle(layerStyle);

      if (layerOpacity) {
        newLayer.setOpacity(layerOpacity);
      }
    }

    return newLayer;
  };

  function createCrrStyleFunction() {
    
    const style02_1 = new Style({fill: new Fill({color:'#2579d4'})});
    const style1_2 = new Style({fill: new Fill({color:'#2a8cf0'})});
    const style2_3 = new Style({fill: new Fill({color:'#1cd0f5'})});
    const style3_5 = new Style({fill: new Fill({color:'#428730'})});
    const style5_7 = new Style({fill: new Fill({color:'#31c749'})});
    const style7_10 = new Style({fill: new Fill({color:'#63dd54'})})
    const style10_15 = new Style({fill: new Fill({color:'#f9e063'})});
    const style15_20 = new Style({fill: new Fill({color:'#fbc65b'})});
    const style20_30 = new Style({fill: new Fill({color:'#fb8349'})});
    const style30_50 = new Style({fill: new Fill({color:'#fd5740'})});
    const style50_plus = new Style({fill: new Fill({color:'#b31b27'})});
    const fallback = new Style({fill: new Fill({color:'#000'})});
      
    return (feature: FeatureLike) => {
      const rainRate = feature.get('rain_rate');
      if (rainRate === 'CRR_02_1') { return style02_1; }
      else if (rainRate === 'CRR_1_2') { return style1_2; }
      else if (rainRate === 'CRR_2_3') { return style2_3 ; }
      else if (rainRate === 'CRR_3_5') { return style3_5 ; }
      else if (rainRate === 'CRR_5_7') { return style5_7 ; }
      else if (rainRate === 'CRR_7_10') { return style7_10 ; }
      else if (rainRate === 'CRR_10_15') { return style10_15 ; }
      else if (rainRate === 'CRR_15_20') { return style15_20; }
      else if (rainRate === 'CRR_20_30') { return style20_30; }
      else if (rainRate === 'CRR_30_50') { return style30_50; }
      else if (rainRate === 'CRR_50_plus') { return style50_plus; }
      else { return fallback; }
    }
  }

  function createRdtStyleFunction() {
    
    const fillStyleCell000 = new Style({fill: new Fill({color:'rgb(254, 41, 59, 0.4)'})}); // red, semi-transparent
    const fillFallback = new Style({fill: new Fill({color:'#ccc'})});

    const lineStyleCell000 = new Style({stroke: new Stroke({color:'rgb(254, 41, 59, 0.9)', width: 1})}); // red
    const lineStyleForecast = new Style({stroke: new Stroke({color:'#000000', width: 2})});
    const lineStylePast = new Style({stroke: new Stroke({color:'#666666', width: 2})});
    const lineFallback = new Style({stroke: new Stroke({color:'#ccc', width: 0})});

    const styleFunction = (feature: FeatureLike) => {

      var fillStyle = null;
      var lineStyle = null;

      const objectType = feature.get('object_type');

      if (objectType === 'cell-000') { fillStyle = fillStyleCell000; }
      else { fillStyle = fillFallback; }

      if (objectType === 'cell-000') { lineStyle = lineStyleCell000; }
      else if (objectType === 'FcstCGTraj') { lineStyle = lineStyleForecast; }
      else if (objectType === 'PastCGTraj') { lineStyle = lineStylePast; }
      else { lineStyle = lineFallback; }

      return [fillStyle, lineStyle];
    };

    return styleFunction;
  }


  const isProductVisible = (productName : string) => {        
    const idxProduct = products.findIndex((pr) => pr.name === productName);
    if (idxProduct !== -1) {
        return products[idxProduct].visible;
    }
    else {
        return false;
    }
}

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */
    
    const crrStyle = createCrrStyleFunction();

    var newOlUidCrr: string|null = null;
    var layer = layerCache[crrLayerId] as Entry;
    if (layer === undefined) {
    //  layer = { ol_uid: null };
    }
    else {
      newOlUidCrr = layer.ol_uid;
    }
    
    const crrIsVisible = isProductVisible("CRR");
    
    const oldLayer = getLayer(currentOlUidCrr);
    const newLayer = getLayer(newOlUidCrr);

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    //showHideLayers(newOlUidCrr, currentOlUidCrr, crrIsVisible, crrStyle, 0.7);
    if (newLayer) {

      if (crrIsVisible) {
        newLayer.setVisible(true);
        newLayer.setStyle(crrStyle);
      }
      else {
        newLayer.setVisible(false);
        newLayer.setStyle(invisibleStyle);
      }
    }

    setCurrentOlUidCrr(newOlUidCrr);
  }, [crrLayerId, products]);

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */

    const rdtStyles = createRdtStyleFunction();

    var newOlUidRdt: string|null = null;
    var layer = layerCache[rdtLayerId] as Entry;
    if (layer === undefined) {
    //  layer = { ol_uid: null };
    }
    else {
      newOlUidRdt = layer.ol_uid;
    }

    const rdtIsVisible = isProductVisible("RDT");
    
    const oldLayer = getLayer(currentOlUidRdt);
    const newLayer = getLayer(newOlUidRdt);

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    //showHideLayers(newOlUidCrr, currentOlUidCrr, crrIsVisible, crrStyle, 0.7);
    if (newLayer) {

      if (rdtIsVisible) {
        newLayer.setVisible(true);
        newLayer.setStyle(rdtStyles);
      }
      else {
        newLayer.setVisible(false);
        newLayer.setStyle(invisibleStyle);
      }
    }

    setCurrentOlUidRdt(newOlUidRdt);


  }, [rdtLayerId, products]);

  return <div className="FastaGraphics"></div>;
};

const Behaviours = () => {
  return null;
};

const FastaGraphic = () => {
  const [displayedLayer, setDisplayedLayer] = useState(null);
  //const layerId = useSelector(selectFastaGraphicProfileId)
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
