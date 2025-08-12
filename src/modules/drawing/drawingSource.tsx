import React, { useEffect, useState } from 'react';
import {
    useAppDispatch as useDispatch,
    useAppSelector as useSelector,
} from '../../hooks';

import { selectCache, Cache, Request, request } from '../../mapping/cacheSlice';

import {
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
import { Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';

interface Props {
    sourceIdentifier: string;
    cache: Cache;
}

export const DrawingSource = (({ sourceIdentifier, cache }: Props) => {
    const dispatch = useDispatch();
    const clickEvent = useSelector(selectClickEvent);
    const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
    const [currentOluid, setCurrentOluid] = useState<String>();
    const layerName = useSelector(selectName);
    const drawMode = useSelector(selectMode);
    const layerID = useSelector(selectLayerID);
    const sliceOluids = useSelector(selectOluids);

    useEffect(() => {
        /*
            ~ need to get the type of drawing here ~
            - should be on a menu or something like that 
            - should also be changing based on a change in mode 
            - drawing needs to prevent dragging some how 
            - request all necessary data into cache 
        */

        //map.getSource() 
        if (!map) {
            return
        } else {
            const vectorSource = new VectorSource({
                wrapX: false
            });
            const layer = new VectorLayer({ source: vectorSource });
            let draw: Draw | undefined;
            let modify: Modify | undefined;
            let value = 'LineString';
            if (value) {
                draw = new Draw({
                    source: vectorSource,
                    type: "Polygon",
                });
                map.addInteraction(draw);


                const modify = new Modify({
                    source: vectorSource
                });
                map.addInteraction(modify);
                draw.on("drawend", (event) => {
                    const feature = event.feature;
                    const oluid = getUid(feature);
                    console.log("ID", oluid);
                    setCurrentOluid(oluid)
                })
            }

            return () => {
                if (draw && modify) {
                    map.removeInteraction(draw);
                    map.removeInteraction(modify);
                }
            };
        }
    }, []);

    // create a request to cache and 
    useEffect(() => {
        console.log(currentOluid);
        if (currentOluid) {
            const cacheID = drawMode + "__" + String(Date.now()) + "__" + String(currentOluid);

            const drawRequest: Request = {
                id: cacheID,
                source: sourceIdentifier,
                layerId: layerID,
                ol_uid: String(currentOluid),
            }
            dispatch(request(drawRequest))
        }

       
    }, [currentOluid])





    return <div className="DrawingSource"></div>;
});

export default DrawingSource;