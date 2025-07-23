import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import OLVectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import GeoJSON from 'ol/format/GeoJSON';
import { Raster, Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Geometry, Polygon } from 'ol/geom';
import { getUid } from 'ol/util';
import { get } from 'ol/proj';
import {
    selectProfileCrrId,
    selectProfileRdtId,
    selectFastaProducts,
    selectCrrVisible,
    selectRdtVisible,
    FastaProduct,
    selectOpacityCRR,
    selectOpacityRDT,
    selectCrrChosenStyle,
} from './../fastaSlice';
import {
    Entry,
    Ingest,
    isEntry,
    request,
    Request,
    selectCache,
} from '../../../mapping/cacheSlice';
import {
    selectCountry,
    selectOpacity,
    selectSeverity,
    selectStyle
} from './capSlice'
import openLayersMap from '../../../mapping/OpenLayersMap';
import BaseLayer from 'ol/layer/Base.js';
import Style, { StyleLike } from 'ol/style/Style.js';
import Fill from 'ol/style/Fill';
import { FeatureLike } from 'ol/Feature';
import { FlatStyleLike } from 'ol/style/flat';
import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import OpenLayersMap from '../../../mapping/OpenLayersMap';
import { hexToRgb } from '@mui/material';



/*
/*
TODO:
    ~ Change colour of the fill based on the severity of the CAP 
    ~ Visibility based on severity
    ~ Visibility based on country
*/

const CapProfile = () => {
    const map = openLayersMap.map;
    const currentStyle = useSelector(selectStyle);
    const currentSeverity = useSelector(selectSeverity);
    const currentCoutry = useSelector(selectCountry);
    const currentOpacity = useSelector(selectOpacity);
    const allCache = useSelector(selectCache);
    const [idList, setIdList] = useState<string[]>([]);
    const [sevList, setSevList] = useState<string[]>([]);
    const getLayer = (
    uid: string | null,
  ): VectorLayer<Feature<Geometry>> | null => {
    let baseLayer: BaseLayer | undefined = undefined;
    let vectorTileLayer: VectorLayer<Feature<Geometry>> | null = null;
    map
      .getLayers()
      .getArray()
      .forEach((l) => {
        if (getUid(l) === uid) {
          baseLayer = l;
        }
      });

    if (baseLayer) {
      vectorTileLayer = baseLayer as VectorLayer<Feature<Geometry>>;
    }
    return vectorTileLayer;
  };

    useEffect(() => {

        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            return element?.source === 'cap' && element?.ol_uid;
        });
        console.log(allCache);
        //console.log(idList);

        setIdList(filteredIds);
        console.log(idList, "FILTER");
    }, [allCache])

    const setColour = ((index: number, id: string) => {
        let newOlUid: string | null = null;

        let layerID: Entry | null = null;



        if(id){
            const layerID = allCache[id] as Entry;
            newOlUid = layerID.ol_uid;
            if (newOlUid){
                const layer = getLayer(newOlUid);
                const hexVal = currentStyle[index];
                const style = new Style({
                    stroke: new Stroke({
                        color: 'black',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: hexVal,
                    })
                });

                layer?.setStyle(style);
            }
        }

   // const hexColour = currentStyle[index];
        // const ol_uid = allCache[id]['ol_uid'];
        // const style = new Style({ fill: new Fill({ color: hexColour }) })

        // const layers = map.getLayers().getArray();
        // let currLayer: BaseLayer | undefined;
        // layers.forEach((layer) => {
        //     if (layer.get('ol_uid') == ol_uid) {
        //         currLayer = layer;
        //         return;
        //     }
        // })
    })

    // Change Colour based on severity
    useEffect(() => {
        // get the severity 
        idList.forEach((id) => {
            const cap = allCache[id];
            console.log(cap, "CAP");
            const sev = cap.severity;
            console.log(sev, "SEV");
            const comp = String(sev).toLowerCase();
            if (comp === 'minor') {
                setColour(0, id);
            } else if (comp === 'moderate') {
                setColour(1, id);
            } else if (comp === 'severe') {
                setColour(2, id);
            } else if (comp === ' extreme') {
                setColour(3, id);
            } else {
                setColour(4, id);
            }
        })
    }, [idList])

    return <div></div>
}

export default CapProfile;
