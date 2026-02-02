import type { WaypointJson } from './types';
import CompositeRoutine from '../routines/CompositeRoutine';
import Waypoint from './Waypoint';
import State from './State';
import FAAMWaypoints from './FAAMWaypoints';

export default class WaypointRegistry {
  // todo: make into a singleton
  static waypoints: { [key: string]: Waypoint } = {};
  static compositeRoutines: CompositeRoutine[] = [];
  constructor() {
    const tempWaypointSet: WaypointJson[] = Object.values(FAAMWaypoints);

    tempWaypointSet.forEach((waypoint: WaypointJson) => {
      WaypointRegistry.registerNewWaypoint(
        new Waypoint(
          waypoint.id,
          waypoint.name,
          waypoint.latitude,
          waypoint.longitude,
        ),
      );
    });
  }

  static registerCompositeRoutine(routine: CompositeRoutine) {
    this.compositeRoutines.push(routine);
  }

  static registerNewWaypoint(waypoint: Waypoint) {
    if (this.waypoints[waypoint.id] != undefined) {
      throw new Error(`Waypoint ${waypoint.name} already exists`);
    } else {
      this.waypoints[waypoint.id] = waypoint;
    }
  }

  static getActiveWaypoints() {
    const activeWaypoints: string[] = [];
    this.compositeRoutines.forEach((routine) => {
      const stateSequence = routine.getStateSequence();
      stateSequence.forEach((state: State) => {
        activeWaypoints.push(state.waypoint.name);
      });
    });
    return [...new Set(activeWaypoints)];
  }

  static getWaypoint(id: string) {
    const waypoint = this.waypoints[id];
    if (waypoint) {
      return waypoint;
    } else {
      return undefined;
    }
  }

  static getNullWaypoint() {
    return new Waypoint(
      'null' + Date.now().toString(),
      'Null',
      { unit: 'dd', value: -9999 },
      { unit: 'dd', value: -9999 },
    );
  }

  static toJson() {
    return Object.values(this.waypoints).map((waypoint) => waypoint.toJson());
  }
}
