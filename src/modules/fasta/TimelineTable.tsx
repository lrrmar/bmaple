import React, {
    useEffect,
    useState,
} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import {
    selectBaseUrl,
} from './fastaSlice';
import './Timeline.css';
import {
    dateAsDisplayString,
    timeAsDisplayString,
    timestampAsDisplayString,
    timestampAsDateTimeDisplayString,
    timestampAsDateDisplayString,
    timezoneAsDisplayString,
} from './dateFormatHelpers';
import heavyRainImage from './timeline_images/heavy_rain.png';
import noRainDayImage from './timeline_images/no_rain_day.png';
import noRainNightImage from './timeline_images/no_rain_night.png';
import rainImage from './timeline_images/rain.png';
import { isMissingDeclaration } from 'typescript';

export interface Timeline {
    [key: string]: string | number;
    location: string; // product
    slot1Time: number;
    slot1: string;
    slot1Icon: number;
    slot2Time: number;
    slot2: string;
    slot2Icon: number;
    slot3Time: number;
    slot3: string;
    slot3Icon: number;
    slot4Time: number;
    slot4: string;
    slot4Icon: number;
    issuedAt: number;
  }


export interface MapLocation {
    [key: string]: string | number;
    name: string;
    lat: number;
    lon: number;
  }

interface Props {
    location : MapLocation;
  }
  
export const TimelineTable = ({ location } : Props) => {

    const fastaBaseUrl = useSelector(selectBaseUrl);

    const [timeline, setTimeline] = useState<Timeline>();

    const fetchTimelines = async (loc : MapLocation) => {

        if (!loc) { return; }

        console.log("fetchTimeline");

        // note token is country specific, this one for ZAMBIA
        const token = 'PKppCvO_Zln4znnSJ7a5eElfDmCkwpqmdGFb2aSf9HI';

        const response = await fetch(
            `https://${fastaBaseUrl}/api/v1/quicklook/?point=${loc.lat},${loc.lon}&token=${token}`,
        );
        const json = await response.json();

        var timeline : Timeline = {
            location: loc.name,
            slot1Time: new Date(json.slots[0].timeslot).getTime(),
            slot1: json.slots[0].icon?.description,
            slot1Icon: json.slots[0].icon?.code,
            slot2Time: new Date(json.slots[1].timeslot).getTime(),
            slot2: json.slots[1].icon?.description,
            slot2Icon: json.slots[1].icon?.code,
            slot3Time: new Date(json.slots[2].timeslot).getTime() + (json.slots[2].offset * 1000 * 60),
            slot3: json.slots[2].icon?.description,
            slot3Icon: json.slots[2].icon?.code,
            slot4Time: new Date(json.slots[3].timeslot).getTime() + (json.slots[3].offset * 1000 * 60),
            slot4: json.slots[3].icon?.description,
            slot4Icon: json.slots[3].icon?.code,
            issuedAt: new Date(json.metadata.issued).getTime()
        };

        setTimeline(timeline);
    }

    useEffect(() => {
        fetchTimelines(location);
    }, []);

    function getImage(code : number | undefined) {

        if (code === undefined) { return; }

        if (code >= 0 && code <= 31) {
            return noRainDayImage;
        }
        else if (code >= 32 && code <= 63) {
            return rainImage;
        }
        else if (code >= 96 && code <= 127) {
            return heavyRainImage;
        }
        return;
    }

    return (
        <div className='timeline'>
            <div className='timeline-location'>
                <span className='location-name'>{location.name}</span>&nbsp;
                <span className='location-latlon'>(lat/lon: {location.lat}, {location.lon})</span>
            </div>
            <table>
                <thead>
                <tr>
                    <th className='timeline-day' colSpan={4}>{timestampAsDateDisplayString(timeline?.slot1Time)}</th>
                </tr>
                <tr>
                    <th className='timeline-slot-time'>{timestampAsDisplayString(timeline?.slot1Time)}</th>
                    <th className='timeline-slot-time'>{timestampAsDisplayString(timeline?.slot2Time)}</th>
                    <th className='timeline-slot-time'>{timestampAsDisplayString(timeline?.slot3Time)}</th>
                    <th className='timeline-slot-time'>{timestampAsDisplayString(timeline?.slot4Time)}</th>
                </tr>
                <tr>
                    <th className='timeline-slot-text'>-1 hour</th>
                    <th className='timeline-slot-text'>Latest</th>
                    <th className='timeline-slot-text'>+1 hour</th>
                    <th className='timeline-slot-text'>+2 hours</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className='icon'><img src={getImage(timeline?.slot1Icon)} width='50px'/></td>
                    <td className='icon'><img src={getImage(timeline?.slot2Icon)} width='50px'/></td>
                    <td className='icon'><img src={getImage(timeline?.slot3Icon)} width='50px'/></td>
                    <td className='icon'><img src={getImage(timeline?.slot4Icon)} width='50px'/></td>
                    </tr>

                    <tr>
                    <td>{timeline?.slot1 ?? "No data"}</td>
                    <td>{timeline?.slot2 ?? "No data"}</td>
                    <td>{timeline?.slot3 ?? "No data"}</td>
                    <td>{timeline?.slot4 ?? "No data"}</td>
                    </tr>
                </tbody>
            </table>
            <div>
                <span className='timeline-issued-text'>Issued at:</span>&nbsp;
                <span className='timeline-issued-text'>{timestampAsDateTimeDisplayString(timeline?.issuedAt)}</span>
            </div>
        </div>
    );
};

export default TimelineTable;
