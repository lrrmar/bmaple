import { WaypointChangeRoutine } from './BaseRoutines';
import Routine from './Routine';
import NullRoutine from './NullRoutine';
import State from '../state/State';

export class ToWaypoint extends WaypointChangeRoutine {
  stateCheck() {
    // TO DO: either waypoint must change or altitude must change!
    return true;
  }

  fixState(entry: State, exit: State) {
    void(1);
  }

  init() {
    super.init();
    // verify pre-given getAltitude()s
  }

  fixRoutineToState() {
    super.fixRoutineToState();
    //fix altitudes
    // start fix chain
  }

  protected altitudeCheck(
    entryAltitude: number,
    exitAltitude: number,
  ): boolean {
    // no check required
    return true;
  }

  toString() {
    if (super.toString()) return super.toString();
    let s = super.toString();
    const exitAltitude = this.getExitState().getAltitude();
    if (exitAltitude) {
      s += ` at ${exitAltitude}`;
    }
    return s;
  }

  calculateDuration() {
    if (super.calculateDuration() != null) {
      return super.calculateDuration();
    }
    const duration = this.altitudeChange();
    if (duration != null) {
      return Math.ceil(duration / 1000); // 1000ft /min
    }
    return duration;
  }

  setEntryAltitude(newAltitude: number) {
    // Can set if there is currently no entry altitude or it is lower/higher than the
    // new entry getAltitude()
    const currentExitAltitude = this.getExitState().getAltitude();
    if (
      !currentExitAltitude ||
      this.altitudeCheck(newAltitude, currentExitAltitude)
    ) {
      this.getEntryState().setAltitude(newAltitude);
      this.getEntryState().entryUpdate();
    } else {
      throw new Error('Cannot set entry altitude');
    }
  }

  setExitAltitude(newAltitude: number) {
    // Can set if there is currently no entry altitude or it is lower/higher than the
    // new exit altitude
    const currentEntryAltitude = this.getEntryState().getAltitude();
    if (
      !currentEntryAltitude ||
      this.altitudeCheck(currentEntryAltitude, newAltitude)
    ) {
      this.getExitState().setAltitude(newAltitude);
      this.getExitState().exitUpdate();
    } else {
      throw new Error('Cannot set exit altitude');
    }
  }

  altitudeChange() {
    const entryAltitude = this.getEntryState().getAltitude();
    const exitAltitude = this.getExitState().getAltitude();
    if (entryAltitude != null && exitAltitude != null) {
      return Math.abs(entryAltitude - exitAltitude);
    } else {
      return null;
    }
  }

  getAltitude() {
    return [
      this.getEntryState().getAltitude(),
      this.getExitState().getAltitude(),
    ];
  }
}

Routine.register('ToWaypoint', ToWaypoint);
