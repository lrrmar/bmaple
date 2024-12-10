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

//import mapObject from '../OLMap.js';
//import getVectorStyle from '../Styles.js';
import {
  selectProfileCrrId,
  selectProfileRdtId
} from './fastaSlice';
import { Entry, request, Request, selectCache } from '../../mapping/cacheSlice';

import openLayersMap from '../../mapping/OpenLayersMap';
import BaseLayer from 'ol/layer/Base.js';
import Style, { StyleLike } from 'ol/style/Style.js';
import Fill from 'ol/style/Fill';
import { FeatureLike } from 'ol/Feature';

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

  const showHideLayers = (newOlUid: string|null, currentOlUid: string|null, layerStyle: StyleLike) => {
    
    const invisibleStyle = (feature: any, resolution: any) => [];

    var newBaseLayer: BaseLayer|undefined = undefined;
    var oldBaseLayer: BaseLayer|undefined = undefined;

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
      var newLayer = newBaseLayer as VectorTileLayer<Feature<Geometry>>;
      if (!newLayer) {
        return;
      }
        /*
        Needed??
        if (newLayer.hasOwnProperty('levels')) {

          newLayer
          .getSource()
          .getFeatures()
          .map((feature) => {
            feature.setStyle(
              getVectorStyle(feature.getProperties().level, newLayer.hex_palette),
            );
          });
        */
      newLayer.setVisible(true);
      newLayer.setStyle(layerStyle);
      newLayer.setOpacity(0.8);
    }
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
    
    const style_cell000 = new Style({fill: new Fill({color:'#fe293b'})});
    const fallback = new Style({fill: new Fill({color:'#ccc'})});

    return (feature: FeatureLike) => {
      const rainRate = feature.get('object_type');
      if (rainRate === 'cell-000') { return style_cell000; }
      else { return fallback; }
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
    showHideLayers(newOlUidCrr, currentOlUidCrr, crrStyle);
    setCurrentOlUidCrr(newOlUidCrr);
  }, [crrLayerId]);

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */

    const rdtFillStyle = createRdtStyleFunction();

    /*
    const rdtLineStyle = {
      'line-color': [
        'match',
        ['get', 'object_type'],
        'cell-000',
        '#fe293b', // red
        'FcstCGTraj',
        '#000000',
        'PastCGTraj',
        '#666666',
        '#ccc',
      ],
      //'line-opacity': hiddenOpacity,
      //'line-width': 2
    };
    */

    var newOlUidRdt: string|null = null;
    var layer = layerCache[rdtLayerId] as Entry;
    if (layer === undefined) {
    //  layer = { ol_uid: null };
    }
    else {
      newOlUidRdt = layer.ol_uid;
    }
    showHideLayers(newOlUidRdt, currentOlUidRdt, rdtFillStyle);

    setCurrentOlUidRdt(newOlUidRdt);
  }, [rdtLayerId]);

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
