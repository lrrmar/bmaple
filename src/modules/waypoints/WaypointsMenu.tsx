import React, { useEffect, useState } from 'react';
import { useAppSelector as useSelector } from '../../hooks';
import { filteredCache } from '../../mapping/cacheSlice';
import { isWaypoint } from '../waypoints/WaypointSourceLayer';

const WaypointsMenu = () => {
  const rawWaypoints = useSelector(filteredCache(isWaypoint));
  const [strippedWaypoints, setStrippedWaypoints] = useState<
    { [key: string]: string | number }[]
  >([]);

  useEffect(() => {
    const stripped = Object.values(rawWaypoints).map((waypoint) => {
      const strippedWaypoint: { [key: string]: string | number } = {};
      strippedWaypoint['latitude'] = waypoint.latitude;
      strippedWaypoint['longitude'] = waypoint.longitude;
      strippedWaypoint['time'] = waypoint.time;
      strippedWaypoint['verticalLevel'] = waypoint.verticalLevel;
      strippedWaypoint['verticalUnits'] = 'hPa';
      return strippedWaypoint;
    });
    setStrippedWaypoints(stripped);
  }, [rawWaypoints]);

  const waypoint: { [key: string]: string | number } = {};
  return <div>{JSON.stringify(strippedWaypoints, null, 2)}</div>;
};

export default WaypointsMenu;
