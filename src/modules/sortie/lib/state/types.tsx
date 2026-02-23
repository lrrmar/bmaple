import type { Routine } from '../routines/types';
import type { WaypointJson } from '../io/types';

export type Measure = {
  [key: string]: number | string;
  value: number;
  unit: string;
};

export function isMeasure(value: unknown): value is Measure {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).value === 'number' &&
    typeof (value as any).unit === 'string'
  );
}

export interface LatLonMeasure extends Measure {
  unit: 'dd';
}

export interface Waypoint {
  id: string;
  name: string;
  latitude: LatLonMeasure;
  longitude: LatLonMeasure;
  setName(value: string): void;
  getLatitude(unit?: string): number;
  setLatitude(value: number): void;
  getLongitude(unit?: string): number;
  setLongitude(value: number): void;
  toJson(): WaypointJson;
}

export interface State {
  isComplete(): boolean;
  isNull(): boolean;
  getEntryForRoutine(): Routine | null;
  setEntryForRoutine(routine: Routine | null): void;
  getExitForRoutine(): Routine | null;
  setExitForRoutine(routine: Routine | null): void;
  clearEntryForRoutine(): void;
  clearExitForRoutine(): void;
  entryUpdate(): void;
  exitUpdate(): void;
  getWaypoint(): Waypoint;
  setWaypoint(waypoint: Waypoint): void;
  getAltitude(): number | null;
  setAltitude(altitude: number): void;
  getBearing(): number | null;
  setBearing(altitude: number): void;
}

export type StateConstructor = {
  waypoint?: Waypoint;
  altitude?: number;
  bearing?: number;
};
