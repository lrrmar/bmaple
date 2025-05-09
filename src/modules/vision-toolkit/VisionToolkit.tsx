import React, { useEffect, useState } from 'react';

import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';

import { selectCache } from '../../mapping/cacheSlice';
import { selectCurrentTrajectory } from '../trajectories/trajectoriesSlice';
import { updateTimeseries } from '../timeseries/timeseriesSlice';
import {
  isEntryWaypoint,
  isPendingWaypoint,
} from '../waypoints/WaypointSourceLayer';

interface SegmentData {
  standard_name: string;
  units: string;
  data: number[];
}

interface Segment {
  time: SegmentData;
  field: SegmentData;
}

interface RequestBody {
  latitude0: number;
  latitude1: number;
  longitude0: number;
  longitude1: number;
  vertical0: number;
  vertical1: number;
  time0: string;
  time1: string;
  verticalType: string;
  verticalUnits: string;
}

function isRequestBody(obj: unknown): obj is RequestBody {
  if (typeof obj !== 'object' || obj === null) return false;

  const body = obj as Record<string, unknown>;

  return (
    typeof body.latitude0 === 'number' &&
    typeof body.latitude1 === 'number' &&
    typeof body.longitude0 === 'number' &&
    typeof body.longitude1 === 'number' &&
    typeof body.vertical0 === 'number' &&
    typeof body.vertical1 === 'number' &&
    typeof body.time0 === 'string' &&
    typeof body.time1 === 'string' &&
    typeof body.verticalType === 'string' &&
    typeof body.verticalUnits === 'string'
  );
}

const VisionToolkit = () => {
  const dispatch = useDispatch();
  const waypointIds = useSelector(selectCurrentTrajectory);
  const cache = useSelector(selectCache);
  const [segments, setSegments] = useState<{ [key: string]: Segment }>({});
  const apiUrl = 'http://localhost:8100';
  //
  //API to fetch from Server
  const apiCall = async (requestBody: RequestBody) => {
    console.log(JSON.stringify(requestBody));
    const response = await fetch(`${apiUrl}/trajectory`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    return data;
  };

  const fetchInterpolatedData = async (
    id: string,
    requestBody: RequestBody,
  ) => {
    /* async function to wrap api call and add response to state (layerData) */
    try {
      const data = await apiCall(requestBody);
      if (data) {
        const updatedSegments = { ...segments };
        const field = data.field;
        const coordinates = data.coordinates;
        updatedSegments[id] = {
          time: coordinates.time,
          field: field,
        };
        setSegments(updatedSegments);
      }
    } catch (error) {
      console.log('Error');
    }
  };

  useEffect(() => {
    // When  new coords pair, call VTK for new segment
    if (waypointIds) {
      for (let i = 0; i < waypointIds.length - 1; i++) {
        const id = waypointIds[i] + waypointIds[i + 1];
        console.log(id);
        if (!segments[id]) {
          // get waypoints from cache
          const startWaypoint = cache[waypointIds[i]];
          const endWaypoint = cache[waypointIds[i + 1]];
          if (
            startWaypoint &&
            endWaypoint &&
            (isEntryWaypoint(startWaypoint) ||
              isPendingWaypoint(startWaypoint)) &&
            (isEntryWaypoint(endWaypoint) || isPendingWaypoint(endWaypoint))
          ) {
            const requestBody = {
              latitude0: startWaypoint.latitude,
              latitude1: endWaypoint.latitude,
              longitude0: startWaypoint.longitude,
              longitude1: endWaypoint.longitude,
              vertical0: startWaypoint.verticalLevel,
              vertical1: endWaypoint.verticalLevel,
              time0: '2025-04-10T' + startWaypoint.time.split('T')[1],
              time1: '2025-04-10T' + endWaypoint.time.split('T')[1],
              verticalType: 'pressure',
              verticalUnits: 'hPa',
            };
            if (isRequestBody(requestBody))
              fetchInterpolatedData(id, requestBody);
          }
        }
      }
    }
  }, [waypointIds]);

  useEffect(() => {
    console.log(segments);
    // whenever values change, dispatch new 'flight' timeseries
    // to timeseriesSlice
    const times: string[] = [];
    const data: number[] = [];
    const variables: string[] = [];
    const units: string[] = [];
    Object.values(segments).forEach((segment) => {
      if (segment.time && segment.field) {
        const stringTimes = segment.time.data.map((time) =>
          new Date(time).toISOString(),
        );
        times.push(...stringTimes);
        data.push(...segment.field.data);
        variables.push(segment.field.standard_name);
        units.push(segment.field.units);
      }
    });

    // Check consistency  in variables and units
    const uniqueVariables = Array.from(new Set(variables));
    const uniqueUnits = Array.from(new Set(units));
    console.log(uniqueVariables, uniqueUnits);
    if (uniqueVariables.length == 1 && uniqueUnits.length == 1) {
      dispatch(
        updateTimeseries({
          id: 'flight',
          timeseries: {
            times: times,
            data: data,
            units: uniqueUnits[0], // TODO
            variable: uniqueVariables[0], //TODO
          },
        }),
      );
    }
  }, [segments]);

  return <div></div>;
};

export default VisionToolkit;
