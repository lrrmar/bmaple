import Routine from './Routine';
import WaypointRegistry from '../state/WaypointRegistry';
import State from '../state/State';
import { type StateConstructor } from '../state/types';
import { RoutineJson } from '../io/types';

export class WaypointChangeRoutine extends Routine {
  stateCheck() {
    return this.getEntryState().getWaypoint() !== this.getExitState().getWaypoint();
  }

  init() {
    super.init();
  }

  toString() {
    if (super.toString()) return super.toString();
    let s = this.constructor.name;
    const entryWaypoint = this.getEntryState().getWaypoint().id;
    const exitWaypoint = this.getExitState().getWaypoint().id;
    if (entryWaypoint && entryWaypoint !== 'Null') {
      s += ` from ${entryWaypoint}`;
    }
    if (exitWaypoint && exitWaypoint !== 'Null') {
      s += ` to ${exitWaypoint}`;
    }
    return s;
  }

  static fromJson(json: RoutineJson) {
    const entryStateInfo: StateConstructor = {};
    const exitStateInfo: StateConstructor = {};

    // waypoint errors
    const waypoint0 = WaypointRegistry.getWaypoint(json.waypoint0);
    if (waypoint0) {
      entryStateInfo['waypoint'] = waypoint0;
    } else {
      throw new Error(`Waypoint ${json.waypoint0} is not registered`);
    }

    if (json.waypoint1) {
      const waypoint1 = WaypointRegistry.getWaypoint(json.waypoint1);
      if (waypoint1) {
        exitStateInfo['waypoint'] = waypoint1;
      } else {
        throw new Error(`Waypoint ${json.waypoint1} is not registered`);
      }
    }

    // altitude
    const altitude0 = json.altitude0;
    if (altitude0) {
      entryStateInfo['altitude'] = altitude0['value'];
    }

    const altitude1 = json.altitude1;
    if (altitude1) {
      exitStateInfo['altitude'] = altitude1['value'];
    }

    const entryState = new State(entryStateInfo);
    const exitState = new State(exitStateInfo);

    const routine = new this({ entry: entryState, exit: exitState});
    routine.init();

    const duration = json.duration;

    if (duration != null) {
      routine.setDuration(duration.value);
    }

    return routine;
  }

  fixRoutineToState() {
    super.fixRoutineToState();
    this.getEntryState().setBearing(this.getEntryBearing());
    this.getExitState().setBearing(this.getExitBearing());
  }

  // class specific

  getHaversine() {
    if (
      this.getEntryState().getWaypoint().name == 'Null' ||
      this.getExitState().getWaypoint().name == 'Null'
    ) {
      return null;
    }
    const lat1 = this.getEntryState().getWaypoint().getLatitude();
    const lon1 = this.getEntryState().getWaypoint().getLongitude();
    const lat2 = this.getExitState().getWaypoint().getLatitude();
    const lon2 = this.getExitState().getWaypoint().getLongitude();
    const R = 2.093e7; // feet
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // in feet
    return d;
  }

  protected calculateBearing(entryState: _State, exitState: _State) {
    const lat1 = entryState.getWaypoint().getLatitude();
    const lon1 = entryState.getWaypoint().getLongitude();
    const lat2 = exitState.getWaypoint().getLatitude();
    const lon2 = exitState.getWaypoint().getLongitude();
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const λ1 = (lon1 * Math.PI) / 180;
    const λ2 = (lon2 * Math.PI) / 180;
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    const brng = ((θ * 180) / Math.PI + 360) % 360; // in degrees
    return brng;
  }

  getEntryBearing() {
    return this.calculateBearing(this.getEntryState(), this.getExitState());
  }

  getExitBearing() {
    return (
      (this.calculateBearing(this.getExitState(), this.getEntryState()) + 180) %
      360
    );
  }

  protected altitudeCheck(
    entryAltitude: number,
    exitAltitude: number,
  ): boolean {
    throw new Error('Not implemented');
  }
}

export class BearingChangeRoutine extends Routine {
  stateCheck() {
    return this.entryState.getWaypoint() == this.exitState.getWaypoint();
  }

  fixRoutineToState() {
    // Similar to WaypointChangeRoutine
    super.fixRoutineToState();
    const previousRoutine = this.getEntryState().getExitForRoutine();
    const nextRoutine = this.getExitState().getEntryForRoutine();

    if (previousRoutine && previousRoutine instanceof WaypointChangeRoutine) {
      this.getEntryState().setBearing(previousRoutine.getExitBearing());
    }
    if (nextRoutine && nextRoutine instanceof WaypointChangeRoutine) {
      this.getExitState().setBearing(nextRoutine.getEntryBearing());
    }
  }

  static fromJson(json: RoutineJson) {
    const entryStateInfo: StateConstructor = {};

    // waypoint errors
    const waypoint0 = WaypointRegistry.getWaypoint(json.waypoint0);
    if (waypoint0) {
      entryStateInfo['waypoint'] = waypoint0;
    } else {
      throw new Error(`Waypoint ${json.waypoint0} is not registered`);
    }
    if (json.waypoint1) {
      throw new Error(`${this.constructor.name} requires a single waypoint.`);
    }

    // altitude
    const altitude0 = json.altitude0;
    if (altitude0) {
      entryStateInfo['altitude'] = altitude0['value'];
    }

    if (json.altitude1) {
      throw new Error(`${this.constructor.name} requires a single altitude.`);
    }

    // Matching since BearingChangeRoutines do not change waypoint or altitude
    const entryState = new State(entryStateInfo);
    const exitState = new State(entryStateInfo);

    const routine = new this({entry: entryState, exit: exitState});
    routine.init();

    const duration = json.duration;

    if (duration != null) {
      routine.setDuration(duration.value);
    }

    return routine;
  }

  getAltitude() {
    return this.getEntryState().getAltitude();
  }
}
