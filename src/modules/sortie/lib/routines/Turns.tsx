import Routine from './Routine';
import { BearingChangeRoutine } from './BaseRoutines';
import State from '../state/State';

abstract class Turn extends BearingChangeRoutine {
  fixState(correctState: State, incorrectState: State) {
    incorrectState.setWaypoint(correctState.getWaypoint());
    incorrectState.setAltitude(correctState.getAltitude());
  }

  stateCheck() {
    return (
      super.stateCheck() &&
      this.entryState.getAltitude() == this.exitState.getAltitude()
    );
  }

  bearingChange() {
    const entryBearing = this.getEntryState().getBearing();
    const exitBearing = this.getExitState().getBearing();
    if (entryBearing && exitBearing) {
      return Math.abs(entryBearing - exitBearing);
    } else {
      return null;
    }
  }
  toString() {
    if (super.toString()) return super.toString();
    let st = `${this.constructor.name} at ${this.getEntryState().getWaypoint().id}`;
    const nextRoutine = this.getExitState().getEntryForRoutine();
    if (nextRoutine) {
      if (!nextRoutine.getExitState().isNull()) {
        st += ` towards ${nextRoutine.getExitState().getWaypoint().id}`;
      }
    }
    return st;
  }

  calculateDuration() {
    if (super.calculateDuration() != null) {
      return super.calculateDuration();
    }
    super.calculateDuration();
    return 2;
  }
}

abstract class PartTurn extends Turn {}

export class InsideTurn extends PartTurn {}
Routine.register('InsideTurn', InsideTurn);

export class OutsideTurn extends InsideTurn {}

abstract class FullTurn extends Turn {}

export class RaceTrackTurn extends FullTurn {}
Routine.register('RaceTrackTurn', RaceTrackTurn);

export class ProcedureTurn extends FullTurn {}

export class FaamTurn extends FullTurn {}
