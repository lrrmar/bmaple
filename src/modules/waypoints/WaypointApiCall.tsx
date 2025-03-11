import React, { useEffect, useState, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  selectCache,
  Cache,
  selectCacheEntries,
  Entry,
  isEntry,
  CacheElement,
} from '../../mapping/cacheSlice';

interface Waypoint extends Entry {
  id: string;
  longitude: string;
  latitude: string;
  properties?: {
    time?: string;
    verticalLevel?: string;
    dataSource?: string;
    dataType?: string;
    dataValue?: string;
    dataVariable?: string;
    dataUnit?: string;
  };
}

export const isWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return (
    isEntry(element) && keys.includes('latitude') && keys.includes('longitude')
  );
};

const WaypointApiCall = () => {
  const cacheEntries: { [key: string]: Entry } =
    useSelector(selectCacheEntries);
  const [maxTemps, setMaxTemps] = useState<{
    [key: string]: { [key: string]: number | string };
  }>({});
  const [infoToRender, setInfoToRender] = useState<React.ReactNode[]>([]);

  const apiCall = async (latitude: string, longitude: string) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&forecast_days=1`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const data = await response.json();
    return data;
  };

  const fetchData = async (id: string, latitude: string, longitude: string) => {
    try {
      const data = await apiCall(latitude, longitude);
      if (data) {
        console.log(data);
        const newMaxTemps = { ...maxTemps };
        newMaxTemps[id] = {
          latitude: latitude,
          longitude: longitude,
          temperature_2m_max: data.daily.temperature_2m_max[0],
        };
        setMaxTemps(newMaxTemps);
      }
    } catch (error) {
      console.log('Error');
    }
  };

  // On a new waypoint entry to cache, fetch data from api
  // and add to maxTemps state
  useEffect(() => {
    const waypoints: Waypoint[] =
      Object.values(cacheEntries).filter(isWaypoint);
    if (waypoints.length === 0) {
      return;
    } else {
      waypoints.forEach((waypoint) => {
        if (maxTemps[waypoint.id]) {
          return;
        } else {
          fetchData(waypoint.id, waypoint.latitude, waypoint.longitude);
        }
      });
    }
  }, [cacheEntries]);

  // On update to maxTemps state, update the infoToRender
  useEffect(() => {
    const newInfoToRender = Object.keys(maxTemps).map((key) => {
      const el = maxTemps[key];
      return (
        <div
          key={el.id}
        >{`At ${el.latitude}, ${el.longitude} the max temperature at 2m is ${el.temperature_2m_max}.`}</div>
      );
    });
    setInfoToRender(newInfoToRender);
  }, [maxTemps]);

  return <div>{infoToRender}</div>;
};

export default WaypointApiCall;
