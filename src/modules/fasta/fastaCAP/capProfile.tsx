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
    update,
} from '../../../mapping/cacheSlice';
import {
    selectCountry,
    selectOpacity,
    selectSeverity,
    selectStyle,
    updateCountryList,
    selectCountryList,
    selectDesiredTime,
    selectClicked,
    updateClick,
    updateOluid,
    selectOluid,
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
import { isTypeOnlyImportOrExportDeclaration } from 'typescript';
import { features } from 'process';


const CapProfile = () => {
    const dispatch = useDispatch();
    const map = openLayersMap.map;
    const currentStyle = useSelector(selectStyle);
    const currentSeverity = useSelector(selectSeverity);
    const currentCountry = useSelector(selectCountry);
    const currentOpacity = useSelector(selectOpacity);
    const allCache = useSelector(selectCache);
    const desTime = useSelector(selectDesiredTime);
    const currentCountryList = useSelector(selectCountryList);
    const clicked = useSelector(selectClicked);
    const currentOluid = useSelector(selectOluid);
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
            const layerID = allCache[id] as Entry; 0
            let hexVal: string;

            newOlUid = layerID.ol_uid;
            if (newOlUid) {
                const layer = getLayer(newOlUid);
                const styleArr = styleList[currentStyle]
                if (index > styleArr.length - 1) {
                    hexVal = "#800080"
                } else {
                    hexVal = styleArr[index];
                }
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

    useEffect(() => {
        //listens to any clicks on the map
        map.on("click", function (event) {
            // if clicked is already true then it sets clicked to false and updates the olUID to all and sets previous polygon stroke to black
            // this is so that if the user clicks an area of the map that isnt the CAP they are not stuck on it
            console.log(clicked, "click");
            if (clicked) {
                dispatch(updateClick(false));
                const layer = getLayer(currentOluid);
                const style = layer?.getStyle() as Style;
                console.log(style, "STYLE");
                if (style) {
                    console.log("in");
                    const stroke = style.getStroke() as Stroke;
                    stroke.setColor("black");
                    style.setStroke(stroke);
                    layer?.setStyle(style);
                    console.log("done");
                    dispatch(updateOluid('All'));
                }
            }
            const features: FeatureLike[] = map.getFeaturesAtPixel(event.pixel, {
                layerFilter: function (layer) {
                    return true;
                }
            })

            // if the feature has a valid oluid and style highlight it and set the oluid 
            console.log(features);
            features.forEach((feature) => {
                const oluid = feature.get('layer_id');
                if (oluid) {
                    const layer = getLayer(oluid);
                    const style = layer?.getStyle() as Style;
                    if (style) {
                        const stroke = style.getStroke() as Stroke;
                        stroke.setColor("#F5F5F5");
                        style.setStroke(stroke);
                        layer?.setStyle(style);
                        dispatch(updateClick(true));
                        console.log(clicked, "clicked 2");
                        dispatch(updateOluid(oluid));
                    }
                }
            })
            console.log("changed style");
        });

        }, [clicked, currentOluid])

        // useEffect(() => {
        //     dispatch(updateClick(false));
        //     console.log(clicked);
        // }, [clicked])


        // set opacity based on input 
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

        }, [idList, currentOpacity, allCache])

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
                    if (compSev === 'all' && compCountry == 'all') {
                        newLayer?.setVisible(true);
                    } else if (layerSev === compSev && layerCountry === compCountry) {
                        newLayer?.setVisible(true);
                    } else if (compSev === 'all' && layerCountry == compCountry) {
                        newLayer?.setVisible(true);
                    } else if (layerSev === compSev && compCountry === 'all') {
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
                    let currentTime = Date.now();
                    const oldLayerID = allCache[id];
                    const oluid = oldLayerID.ol_uid;
                    const newLayer = getLayer(String(oluid));
                    const start = oldLayerID.start;
                    const end = oldLayerID.end;
                    const twoHoursMS = 1000 * 60 * 60 * 2;
                    const aDayInMs = 1000 * 60 * 60 * 24;

                    if (desTime === 0) {
                        currentTime -= aDayInMs;
                    } else if (desTime === 0.25) {
                        currentTime -= twoHoursMS;
                    } else if (desTime === 0.75) {
                        currentTime += twoHoursMS;
                    } else if (desTime === 1) {
                        currentTime += aDayInMs;
                    }
                    //console.log(start, end, "FALSE TIME");

                    if (start && end) {
                        const startTime = new Date(String(start));
                        const endTime = new Date(String(end));
                        if (startTime.getTime() < currentTime && endTime.getTime() > currentTime) {
                            newLayer?.setVisible(true);
                        } else {
                            newLayer?.setVisible(false);
                        }
                    } else {
                        newLayer?.setVisible(true);
                    }
                }

            })
        }, [idList, allCache, desTime])
        return <div></div>
    }

export default CapProfile;

