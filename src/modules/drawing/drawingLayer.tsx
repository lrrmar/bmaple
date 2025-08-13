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
    console.log("IN");
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
                feature.set('layer_id', getUid(layer));

                const map = openLayersMap.map;
                map.addLayer(layer);
                console.log(layer);
                const oldLayer = allCache[id];
            }

        }



    }, [allCache])


    return <div></div>
}
export default DrawingLayer