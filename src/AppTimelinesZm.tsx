import React, { useEffect, useState } from 'react';
import { configureStore } from '@reduxjs/toolkit';

import mapReducer from './mapping/mapSlice';
import cacheReducer from './mapping/cacheSlice';
import Map from './mapping/Map';
import Profiles from './mapping/Profiles';
import Sources from './mapping/Sources';
import './App.css';
import BaseMaps from './mapping/BaseMaps';
import LightBaseMap from './mapping/LightBaseMap';
import DarkBaseMap from './mapping/DarkBaseMap';
import OSMBaseMap from './mapping/OSMBaseMap';
import FloatingBox from './features/FloatingBox';
import DomainSelector from './modules/fasta/DomainSelector';
import TimelineReport from './modules/fasta/TimelineReport';

import waypointReducer from './modules/waypoints/waypointSlice';
import WaypointSource from './modules/waypoints/WaypointSource';
import WaypointProfile from './modules/waypoints/WaypointProfile';
import { Location, LocationsList } from './modules/fasta/LocationsList';
import ZambiaLocationsSource from './modules/fasta/ZambiaLocationsSource';

interface SourceProps {
  sourceIdentifier: string;
  cache?: number;
}

const floatingBoxStyle = {
  top: '20px',
  right: '20px',
  borderColor: 'black',
  borderWidth: '2px',
  borderStyle: 'solid',
  backgroundColor: 'rgba(255,255,255,0.8)',
};

const pStyle = { color: '#000' };

const locationsFloatingBoxStyle = {
  top: '50px',
  right: '20px',
  borderColor: 'black',
  borderWidth: '2px',
  borderStyle: 'solid',
  backgroundColor: 'rgba(255,255,255,0.8)',
};

const domainsFloatingBoxStyle = {
  top: '50px',
  left: '20px',
  borderColor: 'black',
  borderWidth: '2px',
  borderStyle: 'solid',
  backgroundColor: 'rgba(255,255,255,0.8)',
};

const AppTimelines = () => {
  useEffect(() => {
    sessionStorage.clear();
    document.title = 'FASTA Timelines';
  }, []);

  const [timelineReportMode, setTimelineReportMode] = useState(false);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [domain, setDomain] = useState<string>('Zambia');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // note API token is country specific
    setToken('PKppCvO_Zln4znnSJ7a5eElfDmCkwpqmdGFb2aSf9HI');
  }, []);

  return timelineReportMode ? (
    <TimelineReport
      locations={locationList}
      token={token}
      setReportMode={setTimelineReportMode}
    />
  ) : (
    <div className="App">
      <Map>
        <Profiles>
          <WaypointProfile />
        </Profiles>
        <Sources>
          <WaypointSource cache={{}} sourceIdentifier={'waypoint'} />
          <ZambiaLocationsSource sourceIdentifier={'waypoint'} />
        </Sources>
        <BaseMaps>
          <DarkBaseMap id={'dark'} />
          <LightBaseMap id={'light'} />
          <OSMBaseMap id={'OSM'} />
        </BaseMaps>
      </Map>
      <FloatingBox style={locationsFloatingBoxStyle}>
        <LocationsList
          sourceIdentifier={'waypoint'}
          domain={domain}
          locations={locationList}
          setLocations={setLocationList}
          setReportMode={setTimelineReportMode}
        ></LocationsList>
      </FloatingBox>
    </div>
  );
};

/*
<FloatingBox style={domainsFloatingBoxStyle}>
<DomainSelector setDomain={setDomain}/>
</FloatingBox>
*/

export default AppTimelines;
