import React, { useDebugValue, useEffect, useState } from 'react';
import {
    useAppDispatch as useDispatch,
    useAppSelector as useSelector,
} from '../../hooks';
import { selectCache, ingest, Ingest } from '../../mapping/cacheSlice';
import { current } from '@reduxjs/toolkit';
import Feature from 'ol/Feature.js';
import Polygon from 'ol/geom/Polygon.js';
import { Text } from 'ol/style';
import { Coordinate } from 'ol/coordinate';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import openLayersMap from '../../mapping/OpenLayersMap';
import { Style } from 'ol/style';
import { Stroke, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getUid } from 'ol/util';
import { wait } from '@testing-library/user-event/dist/utils';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { Geometry } from 'ol/geom';
import BaseLayer from 'ol/layer/Base';
import { selectName } from './drawlingSlice'
import { getuid } from 'process';


const DrawingLayer = ({
    id,
    sourceIdentifier
}: {
    id: string,
    sourceIdentifier: string
}) => {
    const allCache = useSelector(selectCache);
    const mapUtils = new OpenLayersMap();
    const map = OpenLayersMap.map;
    const layerName = useSelector(selectName);
    const dispatch = useDispatch();

    // get the drawn coordinates and create a layer for them.
    useEffect(() => {
        if (id) {
            const getDrawing = allCache[id];
            const coordinates = getDrawing['coordinates'] as number[];
            
            console.log(coordinates);

            if (coordinates) {
                const latlonArr = []
                // format the coordinates
                for (let i = 0; i <= coordinates.length / 2; i += 2) {
                    const lon = coordinates[i];
                    const lat = coordinates[i + 1];
                    latlonArr.push([lon, lat])
                    console.log([lon, lat])
                }

                // close the polygon 
                latlonArr.push(latlonArr[0]);

                // add feature to current layer
                const feature = new Feature({
                    geometry: new Polygon([latlonArr]),
                });

                const source = new VectorSource({
                    wrapX: false,
                    features: [feature],
                });

                const layer = new VectorLayer({
                    source: source,
                    visible: false,
                    zIndex: 100,
                });
                console.log(getUid(layer), " UID");
                feature.set('layer_id', getUid(layer));

                const map = openLayersMap.map;
                map.addLayer(layer);
                console.log(layer);
                const oldLayer = allCache[id];

                // update the cache to include the oluid of the new layer
                const toCache: Ingest = {
                    id: id,
                    source: sourceIdentifier,
                    coordinates: coordinates,
                    layerName: layerName,
                    layerId: getUid(layer),
                    ol_uid: String(oldLayer.ol_uid),
                }
                dispatch(ingest( toCache));
            }
        }

    }, [])




    return <div></div>
}
export default DrawingLayer