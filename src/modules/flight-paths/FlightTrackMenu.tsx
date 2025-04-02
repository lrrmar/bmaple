import React from 'react';
import { useAppSelector as useSelector } from '../../hooks';
import { filteredCache } from '../../mapping/cacheSlice';
import { selectTimeSortedWaypointIds } from '..//waypoints/waypointSlice';
import { isWaypoint, Waypoint } from '../waypoints/WaypointSourceLayer';
import { isFlightTrack } from '../flight-paths/FlightTrackSourceLayer';

const FlightTrackMenu = () => {
  const waypoints = useSelector(filteredCache(isWaypoint));
  const flightTracks = useSelector(filteredCache(isFlightTrack));
  const sortedWaypointIds = useSelector(selectTimeSortedWaypointIds);
  const handleClick = () => {
    console.log('click');
    // filter sorted waypoint ids such that it only contains ids of waypoints
    // which are used as a start OR end waypoint in a flight track
    const flightTrackWaypointIds = sortedWaypointIds.filter((id) =>
      Object.values(flightTracks).find(
        (ft) => ft.startWaypoint == id || ft.endWaypoint == id,
      ),
    );

    // Get waypoints that were used in flight track
    const flightTrackWaypoints = flightTrackWaypointIds.map((id) => {
      const waypoint: { [key: string]: string | number } = {};
      waypoint['latitude'] = waypoints[id].latitude;
      waypoint['longitude'] = waypoints[id].longitude;
      waypoint['time'] = waypoints[id].time;
      waypoint['verticalLevel'] = waypoints[id].verticalLevel;
      waypoint['verticalUnits'] = 'hPa';
      return waypoint;
    });
    const blob = new Blob([JSON.stringify(flightTrackWaypoints, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waypoints.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(flightTrackWaypoints);
  };

  return (
    <div>
      <button onClick={handleClick}>Get JSON</button>
    </div>
  );
};

export default FlightTrackMenu;
