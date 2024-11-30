import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import OLVectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorSource } from 'ol/source';
import { get } from 'ol/proj';

import mapObject from '../OLMap.js';
import getVectorStyle from '../Styles.js';
import {
  selectLayerCache,
  selectFastaCrrGraphicProfileId,
  selectFastaRdtGraphicProfileId,
} from '../mapSlice';

const Picker = () => {
  /* currently handled in layerSelector
   */
  return null;
};

const Graphics = () => {
  var map = mapObject.getInstance();
  const crrLayerId = useSelector(selectFastaCrrGraphicProfileId);
  const rdtLayerId = useSelector(selectFastaRdtGraphicProfileId);
  const layerCache = useSelector(selectLayerCache);
  const [currentOlUidCrr, setCurrentOlUidCrr] = useState(null);
  const [currentOlUidRdt, setCurrentOlUidRdt] = useState(null);

  const showHideLayers = (newOlUid, currentOlUid, layerStyle) => {
    const invisibleStyle = (feature, resolution) => [];

    var newLayer;
    var oldLayer;
    map
      .getLayers()
      .getArray()
      .forEach((l) => {
        if (l.ol_uid === newOlUid) {
          newLayer = l;
        }
        if (l.ol_uid === currentOlUid) {
          oldLayer = l;
        }
      });

    if (oldLayer) {
      oldLayer.setVisible(false);
      oldLayer.setStyle(invisibleStyle);
    }

    if (!newLayer) {
      return;
    }

    if (newLayer.hasOwnProperty('levels')) {
      newLayer
        .getSource()
        .getFeatures()
        .map((feature) => {
          feature.setStyle(
            getVectorStyle(feature.getProperties().level, newLayer.hex_palette),
          );
        });
    }
    newLayer.setVisible(true);
    newLayer.setStyle(layerStyle);
    newLayer.setOpacity(0.8);
  };

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */
    //const map = mapObject.getInstance()

    const crrStyle = {
      'fill-color': [
        'match',
        ['get', 'rain_rate'],
        'CRR_02_1',
        '#2579d4',
        'CRR_1_2',
        '#2a8cf0',
        'CRR_2_3',
        '#1cd0f5',
        'CRR_3_5',
        '#428730',
        'CRR_5_7',
        '#31c749',
        'CRR_7_10',
        '#63dd54',
        'CRR_10_15',
        '#f9e063',
        'CRR_15_20',
        '#fbc65b',
        'CRR_20_30',
        '#fb8349',
        'CRR_30_50',
        '#fd5740',
        'CRR_50_plus',
        '#b31b27',
        '#000',
      ],
    };

    var layer = layerCache[crrLayerId];
    if (layer === undefined) {
      layer = { ol_uid: null };
    }
    const newOlUidCrr = layer.ol_uid;
    showHideLayers(newOlUidCrr, currentOlUidCrr, crrStyle);
    setCurrentOlUidCrr(newOlUidCrr);
  }, [crrLayerId]);

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */
    //const map = mapObject.getInstance()
    const rdtFillStyle = {
      'fill-color': [
        'match',
        ['get', 'object_type'],
        'cell-000',
        '#fe293b', // red
        '#ccc',
      ],
    };
    //  'fill-opacity': hiddenOpacity

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

    var layer = layerCache[rdtLayerId];
    if (layer === undefined) {
      layer = { ol_uid: null };
    }
    const newOlUidRdt = layer.ol_uid;
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
  const map = mapObject.getInstance();
  return (
    <div className="FastaGraphic">
      {/*<Picker />*/}
      <Graphics />
      {/*<Behaviours />*/}
    </div>
  );
};

export default FastaGraphic;
