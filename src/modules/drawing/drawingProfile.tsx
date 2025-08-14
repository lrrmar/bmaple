import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectEraser, selectName } from "./drawlingSlice";
import { remove, Remove, selectCache } from "../../mapping/cacheSlice";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import { getUid } from "ol";
import OpenLayersMap from "../../mapping/OpenLayersMap";




const DrawingProfile = (() => {
    const layerName = useSelector(selectName);
    const allCache = useSelector(selectCache);
    const map = OpenLayersMap.map;
    const isEraser = useSelector(selectEraser);
    const [drawingIdList, setDrawingList] = useState<string[]>([]);
    const dispatch = useDispatch();
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

    // make selected layer visible
    useEffect(() => {
        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            const source = element.source;
            return source === 'draw';
        });

        // set all 

        filteredIds.forEach((id) => {
            const currentDrawingObj = allCache[id];
            const cacheLayerName: string = currentDrawingObj.layerName as string;
            if (layerName === cacheLayerName) {
                const layerOluid = currentDrawingObj.layerId;
                const layer = getLayer(String(layerOluid));
                layer?.setVisible(true);
            } else {
                const layerOluid = currentDrawingObj.layerId;
                const layer = getLayer(String(layerOluid));
                layer?.setVisible(false);
            }

        })

    }, [layerName, allCache])

    //erase items off of the map when eraser is true
    useEffect(() => {
        if (isEraser) {
            map.on('click', function (event) {
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
                console.log(features, "FEAT");
                const toDeleteOluids: Remove[] = [];
                features.forEach((feature) => {
                    const oluid = feature.get('layer_id')
                    const layer = getLayer(oluid);
                    if (layer){
                        map.removeLayer(layer);
                    }
                    
                    // filteredIds.forEach((id) => {
                    //     console.log(String(allCache[id].ol_uid), " ", String(oluid))
                    //     if (String(allCache[id].ol_uid) === String(oluid)) {
                    //         const toRemoveId: Remove = {
                    //             id: id,
                    //         };
                    //         toDeleteOluids.push(toRemoveId);

                    //     }
                    // })
                })
                console.log(toDeleteOluids);
                dispatch(remove(toDeleteOluids));
            })
        } else {
            map.removeEventListener("click", function (event) {
                return
            });
        }


    }, [isEraser])

    // select or unselect drawing mode

    // change the colour of the lines

    // change the drawing mode between line string and polygon





    return <div></div>
})

export default DrawingProfile;