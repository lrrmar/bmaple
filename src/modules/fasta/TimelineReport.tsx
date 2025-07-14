import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Timeline, TimelineTable } from './TimelineTable';
import { timezoneDisplayString } from './dateFormatHelpers';
import './Timeline.css';
import { Location, LocationsList } from './LocationsList';
import { updateMode, selectMode } from '../waypoints/waypointSlice';

import { isMissingDeclaration } from 'typescript';

interface Props {
  locations: Location[];
  token: string;
  setReportMode: Dispatch<SetStateAction<boolean>>;
}

export const TimelineReport = ({ locations, token, setReportMode }: Props) => {
  const dispatch = useDispatch();

  const timeZoneString = timezoneDisplayString(Date.now());

  const timelinesToLoad = locations.map((loc: Location, i: number) => {
    console.log('timelinesToLoad');
    return <TimelineTable location={loc} token={token} key={i} />;
  });

  return (
    <div className="timeline-report">
      <button
        onClick={(e) => {
          setReportMode(false);
          //e.stopPropagation();
          //e.preventDefault();
        }}
      >
        Back to Map
      </button>

      <div className="timeline-title">Timeline Report</div>
      <div className="timeline-timezone-label">Timezone: {timeZoneString}</div>
      {timelinesToLoad}
    </div>
  );
};

export default TimelineReport;
