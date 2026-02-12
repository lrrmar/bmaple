import { type Measure, isMeasure, LatLonMeasure } from '../state/types';
export interface WaypointJson {
  id: string;
  name: string;
  latitude: LatLonMeasure;
  longitude: LatLonMeasure;
}

type RoutineName =
  | 'SLR'
  | 'Transit'
  | 'OutsideTurn'
  | 'InsideTurn'
  | 'RaceTrackTurn'
  | 'ProfileAscent'
  | 'CranfieldTakeOff'
  | 'ProfileDescent'
  | 'NullRoutine';

export type RoutineJson = {
  routine: RoutineName;
  id?: string;
  waypoint0: string;
  waypoint1?: string;
  altitude0?: Measure;
  altitude1?: Measure;
  bearing0?: Measure;
  bearing1?: Measure;
  duration?: Measure;
};

export type RoutineSequence = RoutineJson[];

const routineNames: readonly RoutineName[] = [
  'SLR',
  'Transit',
  'OutsideTurn',
  'InsideTurn',
  'RaceTrackTurn',
  'ProfileAscent',
  'ProfileDescent',
  'CranfieldTakeOff',
  'NullRoutine',
];

export function isRoutineName(value: unknown): value is RoutineName {
  return (
    typeof value === 'string' && routineNames.includes(value as RoutineName)
  );
}

export function isRoutineJson(value: unknown): value is RoutineJson {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as any;

  if (!isRoutineName(obj.routine)) return false;
  if (typeof obj.waypoint0 !== 'string') return false;

  if (obj.waypoint1 !== undefined && typeof obj.waypoint1 !== 'string') {
    return false;
  }

  if (obj.altitude0 !== undefined && !isMeasure(obj.altitude0)) {
    return false;
  }

  if (obj.altitude1 !== undefined && !isMeasure(obj.altitude1)) {
    return false;
  }

  if (obj.duration !== undefined && !isMeasure(obj.duration)) {
    return false;
  }

  return true;
}

export function isRoutineJsonArray(value: unknown): value is RoutineJson[] {
  if (!Array.isArray(value)) {
    console.log('not array');
    return false;
  }

  return value.every(isRoutineJson);
}
