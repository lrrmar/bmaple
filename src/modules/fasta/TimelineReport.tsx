import React, {
    useEffect,
    useState,
} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import { Timeline, MapLocation, TimelineTable } from './TimelineTable';
import {
    timezoneDisplayString,
} from './dateFormatHelpers';
import './Timeline.css';

import { isMissingDeclaration } from 'typescript';


export const TimelineReport = () => {

    const timeZoneString = timezoneDisplayString(Date.now());
    
    var places : MapLocation[] = [
        { name: "1. Lusaka, Lusaka Province", lat: -15.407, lon: 28.287},
        { name: "2. Ndola, Copperbelt", lat: -12.959, lon: 28.637},
        { name: "3. Kasama, Northern Province", lat: -10.213, lon: 31.181},
        { name: "4. Chinsali, Muchinga ", lat:-10.552, lon :32.069},
        { name: "5. Kabwe, Central Province", lat:	-14.447, lon: 28.446},
        { name: "6. Livingstone, Southern Province", lat: -17.842, lon: 25.854},
        { name: "7. Mongu, Western", lat: -15.248, lon: 23.127},
        { name: "8. Mansa, Luapula",  lat: -11.200, lon: 28.894},
        { name: "9. Solwezi, North-Western", lat: -12.169, lon: 26.389},
        { name: "10. Chipata, Eastern Province", lat: -13.633, lon: 32.65}
    ];
    
    const timelinesToLoad = places.map((loc : MapLocation) => {
        console.log ("timelinesToLoad");
        return <TimelineTable location={loc} />;
    });    

    return (
        <div className="timeline-report">
            <div className="timeline-title">Zambia Timeline Report</div>
            <div className="timeline-timezone-label">Timezone: {timeZoneString}</div>
            {timelinesToLoad}
        </div>
    );
};

export default TimelineReport;
