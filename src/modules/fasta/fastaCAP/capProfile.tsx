import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    remove,
    Remove,
} from '../../../mapping/cacheSlice';
import {
    selectCountry,
    selectOpacity,
    selectSeverity,
    selectStyle,
    updateCountryList,
    selectCountryList,
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
import { Text } from 'ol/style';


const CapProfile = () => {
    const dispatch = useDispatch();
    const map = openLayersMap.map;
    const currentStyle = useSelector(selectStyle);
    const currentSeverity = useSelector(selectSeverity);
    const currentCountry = useSelector(selectCountry);
    const currentOpacity = useSelector(selectOpacity);
    const allCache = useSelector(selectCache);
    const currentCountryList = useSelector(selectCountryList);
    const styleList: { [key: string]: string[] } = {
        'default': ['#ff0000', '#ec8100', '#ffe909', '#baff04', '#a0fffd'],
        'rainbow': ['#2579d4', '#2a8cf0', '#1cd0f5', '#428730', '#31c749'],
        'tol': ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77'],
        'viridis': ['#fde725', '#c2df23', '#86d549', '#52c569', '#2ab07f'],
    };

    const [idList, setIdList] = useState<string[]>([]);
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

    // get list of all ids from cap source
    useEffect(() => {

        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            return element?.source === 'cap' && element?.ol_uid;
        });

        setIdList(filteredIds);
    }, [allCache])

    // keep track of the countries that have active CAP alerts 
    useEffect(() => {
        let countryList: string[] = [];

        idList.forEach((id) => {
            const cacheCap = allCache[id];
            if (cacheCap) {
                const cCountry = cacheCap.country;
                const cCountry2 = String(cCountry);
                if (countryList.indexOf(cCountry2) < 0) {
                    countryList.push(cCountry2);
                }
            }
        })
        dispatch(updateCountryList(countryList));
    }, [idList])

    // set colour based on parameters from severity check
    const setColour = ((index: number, id: string) => {
        let newOlUid: string | null = null;

        let layerID: Entry | null = null;

        if (id) {
            const layerID = allCache[id] as Entry;0
            let hexVal: string;

            newOlUid = layerID.ol_uid;
            if (newOlUid) {
                const layer = getLayer(newOlUid);
                const styleArr = styleList[currentStyle]
                hexVal = styleArr[index];
                const currentText = String(allCache[id]?.event + " \n" + allCache[id]?.severity)
                const style = new Style({
                    stroke: new Stroke({
                        color: 'black',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: hexVal,
                    }),
                    text: new Text({
                            textAlign: 'center', 
                            font: '12px bold Arial', 
                            fill: new Fill({ color: '#000' }),
                            stroke: new Stroke({ color: '#fff', width: 4 }),
                            text: currentText,
                            offsetX: 0,
                            offsetY: 0,
                        }),
                });

                layer?.setStyle(style);
            }
        }
    })

    // Change Colour based on severity
    useEffect(() => {
        // get the severity 
        idList.forEach((id) => {
            const cap = allCache[id];
            const sev = cap.severity;
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
    }, [idList, currentStyle])


    // set opacity based on input i havent made yet
    useEffect(() => {
        idList.forEach((id) => {
            let newOlUid: string | null = null;
            let layerID: Entry | null = null;

            if (id) {
                layerID = allCache[id] as Entry;
                newOlUid = layerID.ol_uid;
                const newLayer = getLayer(newOlUid);
                newLayer?.setOpacity(currentOpacity);
            }
        })

    }, [idList, currentOpacity])

    // filter by severity and country
    useEffect(() => {
        idList.forEach((id) => {
            if (id) {
                const oldLayer = allCache[id];
                const newOlUid = oldLayer.ol_uid;
                const layerSev = String(oldLayer.severity).toLowerCase();
                const layerCountry = String(oldLayer.country).toLowerCase();
                const compSev = currentSeverity.toLowerCase();
                const compCountry = currentCountry.toLowerCase();
                const newLayer = getLayer(String(newOlUid));
                if (compSev === 'all' && compCountry =='all') {
                    newLayer?.setVisible(true);
                } else if (layerSev === compSev && layerCountry === compCountry) {
                    newLayer?.setVisible(true);
                } else if (compSev === 'all' && layerCountry == compCountry){
                    newLayer?.setVisible(true);
                } else if ( layerSev === compSev && compCountry === 'all'){
                    newLayer?.setVisible(true);
                } else {
                    newLayer?.setVisible(false);
                }
            }
        })

    }, [idList, currentSeverity, currentCountry])

    // Ensure that the alert is in the right time frame 
    useEffect(() => {
        idList.forEach((id) => {
            if (id) {
                const currentTime = Date.now();
                const oldLayerID = allCache[id];
                const oluid = oldLayerID.ol_uid;
                const newLayer = getLayer(String(oluid));
                const start = oldLayerID.start;
                const end = oldLayerID.end;


                if (start) {
                    const startTime = new Date(String(start));
                    if (startTime.getTime() < currentTime) {
                        newLayer?.setVisible(true);
                    } else {
                        newLayer?.setVisible(false);
                    }
                } else {
                    newLayer?.setVisible(true);
                }
                if (end) {
                    const endTime = new Date(String(end));
                    if (endTime.getTime() < currentTime) {
                        const rem: Remove = {
                            id: id,
                        }
                        dispatch(remove(rem));
                    }
                }

                newLayer?.setVisible(true);
            }
        })
    }, [idList, allCache])
    return <div></div>
}

export default CapProfile;
