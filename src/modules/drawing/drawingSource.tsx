import React, { useEffect, useState } from 'react';
import {
    useAppDispatch as useDispatch,
    useAppSelector as useSelector,
} from '../../hooks';

import { selectCache, Cache, Request, request } from '../../mapping/cacheSlice';

import {
    selectEraser,
    selectFreehand,
    selectIsDrawing,
    selectLayerID,
    selectMode,
    selectName,
    selectOluids
} from './drawlingSlice'


import {
    selectClickEvent,
    selectFeaturesAtClick,
    selectDisplayTime,
    selectVerticalLevel,
    FeatureAtClick,
} from '../../mapping/mapSlice';
import { fromLonLat } from 'ol/proj';
import { getUid } from 'ol/util';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { Draw, Modify } from 'ol/interaction'
import Map from 'ol/Map'
import VectorSource from 'ol/source/Vector';
import { Polygon, SimpleGeometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import DrawingLayer from './drawingLayer';
import { Coordinate } from 'ol/coordinate';

interface Props {
    sourceIdentifier: string;
    cache: Cache;
}

export const DrawingSource = (({ sourceIdentifier, cache }: Props) => {
    const dispatch = useDispatch();
    const map = OpenLayersMap.map;
    const [currentOluid, setCurrentOluid] = useState<String>();
    const layerName = useSelector(selectName);
    const drawMode = useSelector(selectMode);
    const layerID = useSelector(selectLayerID);
    const allCache = useSelector(selectCache);
    const [layers, setLayers] = useState<JSX.Element[]>([]);
    const [currentCoordinates, setCurrentCoordinates] = useState<number[]>([]);
    const isDrawing = useSelector(selectIsDrawing);
    const mode  = useSelector(selectMode);
    const freehand = useSelector(selectFreehand);
    const isEraser = useSelector(selectEraser);

    useEffect(() => {
        /*
            ~ need to get the type of drawing here ~
            - should be on a menu or something like that 
            - should also be changing based on a change in mode 
            - drawing needs to prevent dragging some how 
            - request all necessary data into cache 
        */

        if (!map) {
            return
        } else if (!isDrawing || isEraser) {
            console.log(isEraser, "erase")
            return
        } else {
            console.log(isEraser, "erase");
            const vectorSource = new VectorSource({
                wrapX: false
            });
            //const layer = new VectorLayer({ source: vectorSource });
            let draw: Draw | undefined;
            let modify: Modify | undefined;
            if (mode) {
                draw = new Draw({
                    source: vectorSource,
                    type: mode,
                    freehand: freehand,
                });
                map.addInteraction(draw);

                draw.on("drawend", (event) => {
                    const feature = event.feature;
                    console.log(event.feature);
                    // capture coords put in cache
                    const geometry = feature.getGeometry() as Polygon;
                    const coordinates = geometry.getCoordinates()[0].flat();
                    console.log(coordinates);
                    const oluid = getUid(feature);
                    console.log("ID", oluid);
                    setCurrentOluid(oluid)
                    setCurrentCoordinates(coordinates);
                })
            }


            return () => {
                if (draw) {
                    map.removeInteraction(draw);
                }
                if (modify) {
                    map.removeInteraction(modify);
                }
            };
        }
    }, [isDrawing, freehand, isEraser]);

    // create a request to cache and 
    useEffect(() => {
        console.log(currentOluid);
        if (currentOluid) {
            const cacheID = drawMode + "__" + String(Date.now()) + "__" + String(currentOluid);

            const drawRequest: Request = {
                id: cacheID,
                source: sourceIdentifier,
                coordinates: currentCoordinates,
                layerName: layerName,
                layerId: layerID,
                ol_uid: String(currentOluid),
            }
            dispatch(request(drawRequest))
        }


    }, [currentOluid])

    useEffect(() => {
        // Get the IDs of all cache elements that have come from this source
        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            const source = element.source;
            return source === sourceIdentifier;
        });

        const components = filteredIds.map((id) => {
            return <DrawingLayer key={id} id={id} sourceIdentifier={sourceIdentifier} />
        });

        setLayers(components);

    }, [allCache]);

    return <div className="drawingSource">{layers}</div>;
});

export default DrawingSource;