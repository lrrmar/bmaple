import React, { useEffect, useState } from 'react';
import {
    useAppDispatch as useDispatch,
    useAppSelector as useSelector,
} from '../../../hooks';
import { request, Request, selectCache, Cache } from '../../../mapping/cacheSlice';
import { current } from '@reduxjs/toolkit';
import Feature from 'ol/Feature.js';
import Polygon from 'ol/geom/Polygon.js';
import { Coordinate } from 'ol/coordinate';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import openLayersMap from '../../../mapping/OpenLayersMap';
import { Style } from 'ol/style';
import { Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { wait } from '@testing-library/user-event/dist/utils';
import CapLayer  from './capLayer';
import { JsxElement } from 'typescript';


interface Props {
    sourceIdentifier: string;
    cache: Cache;
}

interface localCap {
    link: string | null;
    fastaId: number | null;
    event: string | null;
    severity: string | null;
    start: string | null;
    end: string | null;
    country: string | null;
    [key: string]: string | number | null;
}

const capWarningSource = ({ sourceIdentifier, cache }: Props) => {
    const dispatch = useDispatch();
    const allCache = useSelector(selectCache);
    const [currentCapArray, setCurrentCapArray] = useState<localCap[]>([]);
    const [currentPolyArray, setCurrentPolyArray] = useState<string[]>([]);
    const [layers, setLayers] = useState<JSX.Element[]>([]);

    // fetch the cap warnings and store in cap list 
    useEffect(() => {
        let capList: Array<localCap> = [];
        const fetchCaps = async () => {
            try {
                const response = await fetch('https://dev.fastaweather.com/api/v1/alerts/?token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0');

                const capJson = await response.json();
                const alertDL = capJson.alerts;
                

                const subsetAlertDL = alertDL.map((ale: localCap) => {
                    const capObj: localCap = {
                        link: ale.link,
                        fastaId: ale.fastaId,
                        event: ale.event,
                        severity: ale.severity,
                        start: ale.start,
                        end: ale.end,
                        country: ale.country,
                    }
                    return capObj;
                })
                console.log(subsetAlertDL, "CAPS");
                setCurrentCapArray(subsetAlertDL);
            } catch (error) {
            }

        }
        fetchCaps();
    }, []);

    // update request list for when the capList changes
    useEffect(() => {
        const allCacheRequests: Request[] = []
        currentCapArray.forEach((cap: localCap) => {
            const id = cap.link;
            if (id) {
                const request: Request = {
                    id: id,
                    source: sourceIdentifier,
                };

                Object.keys(cap).forEach((key: string) => {
                    if (key === 'id' || key === 'source') return;
                    const val = cap[key];
                    if (val) request[key] = val;
                })
                allCacheRequests.push(request);
            }

        })
        console.log("all CAP cache requests:  ", allCacheRequests);
        // put list in cache
        dispatch(request(allCacheRequests));
        // should change this to currentLayerArray and ol uid 
    }, [currentCapArray])

    useEffect(() => {
        // Get the IDs of all cache elements that have come from this source
        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            const source = element.source;
            return source === sourceIdentifier;
        });

        const components = filteredIds.map((id) => {
            return <CapLayer key={id} id={id} sourceIdentifier={sourceIdentifier} />
        });

        setLayers(components);
    }, [allCache]);


    return <div className="capSource">{layers}</div>
}

export default capWarningSource;