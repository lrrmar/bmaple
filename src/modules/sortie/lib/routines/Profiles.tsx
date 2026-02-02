import { WaypointChangeRoutine } from './BaseRoutines';
import Routine from './Routine';
import NullRoutine from './NullRoutine';
import State from '../state/State';

export abstract class Profile extends WaypointChangeRoutine {
  stateCheck() {
    const entryAltitude = this.getEntryState().getAltitude();
    const exitAltitude = this.getExitState().getAltitude();
    const altitudeCheck: boolean =
      entryAltitude && exitAltitude
        ? this.altitudeCheck(entryAltitude, exitAltitude)
        : true;
    return super.stateCheck() && altitudeCheck;
  }

  protected InverseProfileClass:
    | typeof ProfileAscent
    | typeof ProfileDescent
    | typeof NullRoutine = NullRoutine;

  fixState(entry: State, exit: State) {
    // Altitude changing in chain could mean that we need to swap between
    // descent and ascent
    const entryAltitude = this.getEntryState().getAltitude();
    const exitAltitude = this.getExitState().getAltitude();
    if (super.stateCheck() && !this.stateCheck()) {
      // Inherited state succeeded, but this state check failed, therefore
      // issue in altitudes
      const replacement = new this.InverseProfileClass({
        entry: this.getEntryState(),
        exit: this.getExitState(),
      });
      replacement.init();
      if (!replacement.isNull()) {
        this.getEntryState().clearEntryForRoutine();
        this.getExitState().clearExitForRoutine();
        replacement.fixRoutineToState();
      }
    }
  }

  init() {
    super.init();
    // verify pre-given getAltitude()s
    const entryAltitude = this.getEntryState().getAltitude();
    const exitAltitude = this.getExitState().getAltitude();
    if (
      entryAltitude &&
      exitAltitude &&
      !this.altitudeCheck(entryAltitude, exitAltitude)
    ) {
      throw new Error(`Cannot ascend from ${entryAltitude} to ${exitAltitude}`);
    }
  }

  fixRoutineToState() {
    super.fixRoutineToState();
    //fix altitudes
    // start fix chain
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
    return [this.getEntryState().getAltitude(), this.getExitState().getAltitude()];
  }
}

export class ProfileAscent extends Profile {
  InverseProfileClass = ProfileDescent;

  protected altitudeCheck(entryAltitude: number, exitAltitude: number) {
    return entryAltitude <= exitAltitude;
  }
}
Routine.register('ProfileAscent', ProfileAscent);

export class ProfileDescent extends Profile {
  InverseProfileClass = ProfileAscent;

  protected altitudeCheck(entryAltitude: number, exitAltitude: number) {
    return entryAltitude >= exitAltitude;
  }
}
Routine.register('ProfileDescent', ProfileDescent);
