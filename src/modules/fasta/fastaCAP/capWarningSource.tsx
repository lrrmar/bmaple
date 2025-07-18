import React, { useEffect, useState } from 'react';
import {
    useAppDispatch as useDispatch,
    useAppSelector as useSelector,
} from '../../../hooks';
import { request, Request, selectCache, Cache } from '../../../mapping/cacheSlice';
import { current } from '@reduxjs/toolkit'; 

interface Props {
    sourceIdentifier: string;
    cache: Cache;
}

interface localCap {
    url: string | null;
    id: number | null;
    event: string | null;
    severity: string | null;
    start: string | null;
    end: string | null;
    country: string | null;
}

const capWarningSource = ({ sourceIdentifier, cache }: Props) => {
    const dispatch = useDispatch();
    const [currentCapArray, setCurrentCapArray] = useState<localCap[]>([]);

    // fetch the cap warnings and store in cap list 
    useEffect(() => {
        let capList: Array<localCap> = [];
        const fetchCaps = async () => {
            const response = await fetch('https://dev.fastaweather.com/api/v1/alerts/?token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0');

            const capJson = await response.json();
            const alertDL = capJson.alerts;

            alertDL.map((ale) => {
                const capObj: localCap = {
                    url: ale.link,
                    id: ale.id,
                    event: ale.event,
                    severity: ale.severity,
                    start: ale.onset,
                    end: ale.expires,
                    country: ale.country,
                }
            })
            setCurrentCapArray(alertDL);
        }
        fetchCaps();

    }, []);

    // update request list for when the capList changes
    useEffect(() => {
        const allCacheRequests: Request[] = currentCapArray.map((cap: localCap) => {
            const request: Request = {
                id: String(cap.id),
                source: 'cap',
            }
            return request;
        })

        console.log("all CAP cache requests:  ", allCacheRequests);
        // put list in cache
        dispatch(request(allCacheRequests));
    }, [currentCapArray])


    return <div className="capSource"> </div>
}

export default capWarningSource;