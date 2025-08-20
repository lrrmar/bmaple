import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectEraser, selectIsDrawing, selectStyleArray, selectName, updateIsDrawing, updateIsEraser } from "./drawlingSlice";
import { remove, Remove, selectCache } from "../../mapping/cacheSlice";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import { getUid } from "ol";
import OpenLayersMap from "../../mapping/OpenLayersMap";
import { unByKey } from "ol/Observable";
import { color, EventsKey, style } from "openlayers";
import { ListenerFunction } from "ol/events";
import { Stroke, Fill, Style } from "ol/style";
import { ColorType } from "ol/expr/expression";
import { lchaToRgba, rgbaToLcha } from "ol/color";




const DrawingProfile = (() => {
    const layerName = useSelector(selectName);
    const allCache = useSelector(selectCache);
    const map = OpenLayersMap.map;
    const isEraser = useSelector(selectEraser);
    const isDrawing = useSelector(selectIsDrawing);
    const [drawingIdList, setDrawingList] = useState<string[]>([]);
    const dispatch = useDispatch();;
    const [eraserEvent, setEraserEvent] = useState<EventsKey>();
    const styleArray = useSelector(selectStyleArray);

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


    // get all features in all layers
    useEffect(() => {
        const newLayerIdList = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            const source = element.source;
            return source === 'draw';
        });

        if (JSON.stringify(newLayerIdList) !== JSON.stringify(drawingIdList)) {
            setDrawingList(newLayerIdList);
        }

    }, [allCache])

    const styleObj =  (() => { 
        let fillCol;
        if ( styleArray['fillColour'] === 'none'){
            fillCol = 'rgba(0,0,0,0)'
        } else {
            fillCol = styleArray['fillColour']
        }
        let strokeCol; 
        if (styleArray['strokeColour'] === 'none'){
            strokeCol = 'rgba(0,0,0,0)'
        } else {
            strokeCol = styleArray['strokeColour']
        }

        return new Style ({
            fill: new Fill ({ 
                color: fillCol
            }),
            stroke: new Stroke ({
                color: strokeCol,
                width: Number(styleArray['strokeWidth']),
            })
        })
    })

    // make selected layer visible and set style accordingly
    useEffect(() => {
        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            const source = element.source;
            return source === 'draw';
        });

        filteredIds.forEach((id) => {
            const currentDrawingObj = allCache[id];
            const cacheLayerName: string = currentDrawingObj.layerName as string;
            if (layerName === cacheLayerName) {
                const layerOluid = currentDrawingObj.layerId;
                const layer = getLayer(String(layerOluid));
                layer?.setVisible(true);
                layer?.setStyle(styleObj)
                console.log(Number(styleArray['opacity']))
                layer?.setOpacity(Number(styleArray['opacity']))
            } else {
                const layerOluid = currentDrawingObj.layerId;
                const layer = getLayer(String(layerOluid));
                layer?.setVisible(false);
            }

        })

    }, [layerName, allCache, styleArray])

    //erase items off of the map when eraser is true
    useEffect(() => {
        if (isEraser) {
            const newClick = map.on('click', function (event) {
                const features = map.getFeaturesAtPixel(event.pixel, {
                    layerFilter: function (layer) {
                        return true;
                    },
                });
                const filteredIds = Object.keys(allCache).filter((id) => {
                    const element = allCache[id];
                    const source = element.source;
                    return source === 'draw';
                });
                const toDeleteOluids: Remove[] = [];
                features.forEach((feature) => {
                    const oluid = feature.get('layer_id')
                    const layer = getLayer(oluid);
                    if (layer) {
                        map.removeLayer(layer);
                    }

                })
                dispatch(remove(toDeleteOluids));
            });
            setEraserEvent(newClick)

        } else if (!isEraser) {
            if (eraserEvent) {
                const listener: ListenerFunction = eraserEvent['listener']
                map.un("click", listener);
            }
        }


    }, [isEraser])

    return <div></div>
})

export default DrawingProfile;