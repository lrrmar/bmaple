import WaypointRegistry from './WaypointRegistry';
import type { Routine } from '../routines/types';
import NullRoutine from '../routines/NullRoutine';
import type { State as _State, Waypoint, StateConstructor } from './types';


export default class State implements _State {
  private waypoint: Waypoint;
  private altitude: number | null = null;
  private bearing: number | null = null;

  private exitForRoutine: Routine | null = null;
  private entryForRoutine: Routine | null = null;

  constructor(init: StateConstructor) {
    if (init['waypoint']) {
      this.waypoint = init['waypoint'];
    } else {
      this.waypoint = WaypointRegistry.getNullWaypoint();
    }
    if (init['altitude'] != null) this.setAltitude(init['altitude']);
    if (init['bearing'] != null) this.setBearing(init['bearing']);
  }

  public setWaypoint(waypoint: Waypoint): void {
    this.waypoint = waypoint;
  }

  public getWaypoint(): Waypoint {
    return this.waypoint;
  }

  public getAltitude(): number | null {
    return this.altitude;
  }

  public setAltitude(altitude: number | null): void {
    this.altitude = altitude;
  }

  public getBearing(): number | null {
    return this.bearing;
  }

  public setBearing(bearing: number| null): void {
    this.bearing = bearing;
  }

  isNull(): boolean {
    return (
      this.waypoint.name == 'Null' &&
      this.altitude == null &&
      this.bearing == null
    );
  }

  isComplete(): boolean {
    return (
      this.waypoint != null && this.altitude != null && this.bearing != null
    );
  }

  getEntryForRoutine() {
    return this.entryForRoutine;
  }

  getExitForRoutine() {
    return this.exitForRoutine;
  }

  setEntryForRoutine(routine: Routine) {
    // set the routine for which this is the exit state
    if (this.entryForRoutine === routine) return;
    if (!this.entryForRoutine || this.entryForRoutine instanceof NullRoutine) {
      this.entryForRoutine = routine;
    } else {
      throw new Error('State is already entry for routine');
    }
  }

  setExitForRoutine(routine: Routine) {
    // set the routine for which this is the exit state
    if (this.exitForRoutine === routine) return;
    if (!this.exitForRoutine || this.exitForRoutine instanceof NullRoutine) {
      this.exitForRoutine = routine;
    } else {
      throw new Error('State is already exit for routine');
    }
  }

  clearEntryForRoutine() {
    this.entryForRoutine = null;
  }

  clearExitForRoutine() {
    this.exitForRoutine = null;
  }

  entryUpdate() {
    // this state has been changed as the entry of a routine
    // i.e. backwards chain
    if (this.exitForRoutine) this.exitForRoutine.exitUpdate();
  }

  exitUpdate() {
    // this state has been changed as the exit of a routine
    // i.e. forwards chain
    if (this.entryForRoutine) this.entryForRoutine.entryUpdate();
  }
}
