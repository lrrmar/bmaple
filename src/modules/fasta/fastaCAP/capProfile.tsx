import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Raster, Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Geometry, Polygon, SimpleGeometry } from 'ol/geom';
import { getUid } from 'ol/util';
import {
    selectCache,
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
import Style from 'ol/style/Style.js';
import Fill from 'ol/style/Fill';
import { FeatureLike } from 'ol/Feature';

import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import { Text } from 'ol/style';
import { Coordinate } from "ol/coordinate";
import { current } from '@reduxjs/toolkit';

const CapProfile = () => {
    const dispatch = useDispatch();
    const map = openLayersMap.map;
    const [parentChildOluid, setParentChildOluid] = useState<{ [key: string]: string[] }>();
    const [coordList, setCoordList] = useState<{ [key: string]: string[] }>();
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
    // stored layer coords and corresponding oluid
    const [layers, setLayers] = useState<{ [key: string]: string }>()

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

    const getCoordinates = ((oluid: string) => {
        const layer = getLayer(oluid);
        const source = layer?.getSource();
        const features = source?.getFeatures()[0];
        const geometery = features?.getGeometry() as SimpleGeometry;
        const coordinates = geometery?.getCoordinates() as Coordinate[][];

        if (coordinates) {
            return coordinates;
        } else {
            return false;
        }

    })

    // this function will filter the Coord List for a coordinate so that duplicates are not shown #
    // and events can be combined in one cluster later on
    const getFilteredCoordList = ((coordinates: string) => {
        const clusterCapDict: { [key: string]: string[] } = {
            'severity': [],
            'event': [],
            'start': [],
            'end': [],
            'ids': [],
        };
        // if there is more than one associated id then we need to compare
        if (coordList && coordList[coordinates]) {
            if (coordList?.[coordinates].length > 1) {
                coordList[coordinates].forEach((id) => {
                    const currentCap = allCache[id];
                    if (String(currentCap.event) != clusterCapDict['event'].find((event) => {
                        return event === String(currentCap.event)
                    })) {
                        clusterCapDict['event'].push(String(currentCap.event));
                    }

                    if (String(currentCap.severity) != clusterCapDict['severity'].find((severity) => {
                        return severity === String(currentCap.severity)
                    })) {
                        clusterCapDict['severity'].push(String(currentCap.severity));
                    }

                    if (String(currentCap.start) != clusterCapDict['start'].find((start) => {
                        return start === String(currentCap.start)
                    })) {
                        clusterCapDict['start'].push(String(currentCap.start));
                    }

                    if (String(currentCap.end) != clusterCapDict['end'].find((end) => {
                        return end === String(currentCap.end)
                    })) {
                        clusterCapDict['end'].push(String(currentCap.end));
                    }

                    clusterCapDict['ids'].push(String(currentCap.ol_uid));
                })
            } else if (coordList) {
                const currentCap = allCache[coordList[coordinates][0]]
                clusterCapDict['severity'] = [String(currentCap.severity)];
                clusterCapDict['event'] = [String(currentCap.event)];
                clusterCapDict['start'] = [String(currentCap.start)];
                clusterCapDict['end'] = [String(currentCap.end)];
                clusterCapDict['ids'] = [String(currentCap.ol_uid)];

            }
        }
        return clusterCapDict;
    })

    const createGradientPattern = ((colourList: string[]) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx?.createLinearGradient(0, 0, canvas.width, canvas.height);
            let i = 0;
            const increment = 1 / colourList.length;
            colourList.forEach((hexVal) => {
                gradient?.addColorStop(i, hexVal)
                i += increment;
            })

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Create and return pattern
            return ctx.createPattern(canvas, 'repeat');
        }

    })

    // get the text for caps that share coordinates
    const getCombinationText = ((clusterCapDict: { [key: string]: string[] }) => {
        const eventList: string[] = clusterCapDict['event'];
        const sevList: string[] = clusterCapDict['severity'];
        let eventText: string = '';
        let sevText: string = '';
        if (eventList.length > 1) {
            eventList.forEach((event) => {
                eventText += event + ', ';
            })
        } else {
            eventText = eventList[0];
        }

        if (sevList.length > 1) {
            sevList.forEach((severity) => {
                sevText += severity + ', ';
            })
        } else {
            sevText = sevList[0] + "\n";
        }

        const combinedText = eventText + " \n " + sevText;
        return new Text({
            textAlign: 'center',
            font: '12px bold Arial',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 4 }),
            text: combinedText,
            offsetX: 0,
            offsetY: 0,
        });


    })

    const getCombinationFill = ((clusterCapDict: { [key: string]: string[] }) => {
        const possibleSevs = ['minor', 'moderate', 'severe', 'extreme']
        const sevList = clusterCapDict['severity'];
        //sevList.push('Severe');
        //console.log(sevList);
        let fill: Fill;
        if (sevList.length > 1) {
            const hexValList: string[] = [];
            sevList.forEach((severity) => {
                const index = possibleSevs.findIndex((sev) => {
                    return sev === severity;
                })
                const hexVal = styleList[currentStyle][index]
                if (hexVal) {
                    hexValList.push(hexVal)
                }
            })
            const gradient = createGradientPattern(hexValList);
            fill = new Fill({
                color: gradient,
            })
            console.log(fill);

        } else {

            const findSev = sevList[0];
            if (findSev) {
                const index = possibleSevs.findIndex((lookSev) => {
                    return lookSev.toLowerCase() === findSev.toLowerCase();
                })
                if (index >= 0) {
                    const hexVal = styleList[currentStyle][index];
                    fill = new Fill({
                        color: hexVal
                    })
                } else {
                    fill = new Fill({
                        color: styleList[currentStyle][4],
                    })
                }
            } else {
                fill = new Fill({});
            }
        }

        return fill;
    })

    const setParentLayer = ((style: Style, coordinates: Coordinate[][]) => {
        const feature = new Feature({
            geometry: new Polygon([coordinates[0]]),
        });

        const source = new VectorSource({
            features: [feature],
        });

        const layer = new VectorLayer({
            source: source,
            style: style,
            visible: false,
            zIndex: 100,
        });

        feature.set("layer_id", getUid(layer));
        map.addLayer(layer);

        return layer;
    })

    // whenever the parent/child oluid list changes then the text and fill should be updated to ensure it is up to date
    useEffect(() => {
        if (parentChildOluid) {
            Object.keys(parentChildOluid).forEach((parentOLUID) => {
                const coords = getCoordinates(parentOLUID);
                const clusterCapDict = getFilteredCoordList(String(coords));
                const text = getCombinationText(clusterCapDict);
                const fill = getCombinationFill(clusterCapDict);
                const layer = getLayer(parentOLUID);
                const style = layer?.getStyle() as Style;
                style.setText(text);
                style.setFill(fill);
                layer?.setStyle(style);
            })
        }
    }, [parentChildOluid, currentStyle])

    useEffect(() => {
        if (layers) {
            // for each coordinate in the top layers, get the ids of associated caps from coordList then use this to get the OLUIDs of those 
            // caps for cap panel functionality and onclick stuff
            Object.keys(layers).forEach((coordinate: string) => {
                const capIdList = coordList?.[coordinate];
                const childOluidList: string[] = [];
                if (capIdList) {
                    capIdList.forEach((id) => {
                        childOluidList.push(String(allCache[id].ol_uid));
                    })
                }
                if (parentChildOluid) {
                    const listOfParentOLUIDs = Object.keys(parentChildOluid);

                    const parentOluid: string = layers[coordinate];
                    const indexOfParent = listOfParentOLUIDs.findIndex((comparisonOLUID) => {
                        return parentOluid === comparisonOLUID;
                    })
                    // if the index is -1 then we create a new key value pair, otherwise we replace the old value with the new list
                    const newPandCOLUID: { [key: string]: string[] } = {};
                    newPandCOLUID[parentOluid] = childOluidList;
                    if (indexOfParent === -1) {
                        setParentChildOluid(prev => ({ ...prev, ...newPandCOLUID }));
                    } else if (indexOfParent > -1) {
                        if (JSON.stringify(parentChildOluid[parentOluid]) != JSON.stringify(childOluidList)) {
                            setParentChildOluid(prev => ({ ...prev, ...newPandCOLUID }))
                        }
                    }
                } else {
                    const parentOluid: string = layers[coordinate];
                    const newPandCOLUID: { [key: string]: string[] } = {};
                    newPandCOLUID[parentOluid] = childOluidList;
                    setParentChildOluid(newPandCOLUID);
                }

            })

        }

    }, [coordList])

    useEffect(() => {
        if (coordList) {
            Object.keys(coordList).forEach((coordinate) => {
                // checks if there is already a layer for the coordinate. If there is then we dont do anything
                if (!layers || Object.keys(layers).findIndex((coords: string) => {
                    return coords === String(coordinate)
                }) === -1) {
                    // gets the filtered coordlist for to create the text and the fill
                    const clusterCapDict = getFilteredCoordList(coordinate);
                    const text: Text = getCombinationText(clusterCapDict);
                    const fill: Fill = getCombinationFill(clusterCapDict);
                    const stroke = new Stroke({
                        color: 'black',
                        width: 2,
                    });
                    const style = new Style({});
                    style.setStroke(stroke);
                    style.setFill(fill);
                    style.setText(text);
                    const coords = getCoordinates(clusterCapDict['ids'][0]);
                    // gets the coordinates and creates the parent layer with the style formed from all the children layers
                    if (coords) {
                        const newLayer = getUid(setParentLayer(style, coords))
                        // adds the coordinates and the newly created oluid to a local state 
                        const newLayerOL: { [key: string]: string } = {};
                        newLayerOL[String(coords)] = newLayer;
                        setLayers(prev => ({ ...prev, ...newLayerOL }));
                    }
                }

            })
        }

    }, [idList])

    useEffect(() => {
        //listens to any clicks on the map
        map.on("click", function (event) {
            // if clicked is already true then it sets clicked to false and updates the olUID to all and sets previous polygon stroke to black
            // this is so that if the user clicks an area of the map that isnt the CAP they are not stuck on it
            if (clicked) {
                dispatch(updateClick(false));

                // not working because those oluids arent being highlighted the parent is 
                const currentOL = Object.keys(currentOluid)[0]
                const layer = getLayer(currentOL);
                const style = layer?.getStyle() as Style;
                if (style) {
                    const stroke = style?.getStroke() as Stroke;
                    stroke.setColor("black");
                    style.setStroke(stroke);
                    layer?.setStyle(style);
                }

                let newOl: { [key: string]: string[] } = {}
                newOl['All'] = ['123', '456'];
                dispatch(updateOluid(newOl));
            }
            const features: FeatureLike[] = map.getFeaturesAtPixel(event.pixel, {
                layerFilter: function (layer) {
                    return true;
                }
            })

            // if the feature has a valid oluid and style highlight it and set the oluid 
            //var counter = 0;
            let oluidArr: { [key: string]: string[] } = {};
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
                        const listOfChildren: { [key: string]: string[] } = {};
                        if (parentChildOluid?.[oluid]) {
                            listOfChildren[oluid] = parentChildOluid[oluid];
                            if (listOfChildren) {
                                oluidArr = listOfChildren;
                            }
                        }
                    }
                }
            })
            if (Object.keys(oluidArr).length === 1) {
                dispatch(updateOluid(oluidArr));
            }
        });

    }, [clicked, currentOluid])

    useEffect(() => {
        const coordGroups: { [key: string]: string[] } = {}
        idList.forEach((id) => {
            const oluid: string = String(allCache[id].ol_uid)
            const coordinates = getCoordinates(oluid);

            if (coordinates) {
                const coordAsString = String(coordinates);
                if (coordGroups[coordAsString]) {
                    coordGroups[coordAsString].push(id);
                } else {
                    coordGroups[coordAsString] = [id];
                }
            }
        })
        setCoordList(coordGroups);
    }, [idList])

    // get list of all ids from cap source
    useEffect(() => {

        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            return element?.source === 'cap' && element?.ol_uid;
        });

        if (JSON.stringify(filteredIds) !== JSON.stringify(idList)) {
            setIdList(filteredIds);
        }
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

    // set opacity based on input 
    useEffect(() => {
        if (parentChildOluid) {
            Object.keys(parentChildOluid).forEach((id) => {
                const layer = getLayer(id);
                layer?.setVisible(true);
                layer?.setOpacity(currentOpacity);
            })
        }

    }, [idList, currentOpacity])


    useEffect(() => {
        if (coordList && layers) {
            // initialise first time constants
            let currentTime = Date.now()
            const aDayInMS = 1000 * 60 * 60 * 24;
            const twoHoursInMS = 1000 * 60 * 60 * 2;
            // makes current time equal to what the user has selected on the time scroller 
            if (desTime === 0) {
                currentTime -= aDayInMS;
            } else if (desTime === 0.25) {
                currentTime -= twoHoursInMS;
            } else if (desTime === 0.75) {
                currentTime += twoHoursInMS;
            } else if (desTime === 1) {
                currentTime += aDayInMS;
            }
            // make empty dict
            const newPCOluid: { [key: string]: string[] } = {};

            Object.keys(coordList).forEach((coordinate: string) => {
                const parentOLUID = layers[coordinate];
                const layer = getLayer(parentOLUID);
                const childList: string[] = [];
                coordList[coordinate].forEach((childOLUID: string) => {
                    const currentCap = allCache[childOLUID];
                    const startTime = new Date(String(currentCap.start));
                    const endTime = new Date(String(currentCap.end));
                    const countryMatches = (currentCountry.toLowerCase() === String(currentCap.country).toLowerCase()) || (currentCountry.toLowerCase() === 'all');
                    const severityMatches = (currentSeverity.toLowerCase() === String(currentCap.severity).toLowerCase()) || (currentSeverity.toLowerCase() === 'all');
                    let inTimeRange = true;
                    if (startTime.getTime() < currentTime && endTime.getTime() > currentTime) {
                        inTimeRange = true;
                    } else if (startTime.getTime() > currentTime || endTime.getTime() < currentTime) {
                        inTimeRange = false;
                    }
                    if (countryMatches && severityMatches && inTimeRange) {
                        childList.push(String(currentCap.ol_uid));
                    }
                })
                if (childList.length > 0) {
                    newPCOluid[layers[coordinate]] = childList;
                    layer?.setVisible(true);
                } else {
                    layer?.setVisible(false);
                }
            })
            setParentChildOluid(newPCOluid);


        }
    }, [currentCountry, currentSeverity, desTime])


    return <div></div>
}

export default CapProfile;



