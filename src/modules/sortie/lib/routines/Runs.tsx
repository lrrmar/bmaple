import Routine from './Routine';
import { WaypointChangeRoutine } from './BaseRoutines';
import State from '../state/State';
import { scienceTrueAirSpeed, transitTrueAirSpeed } from './physics';

export class SLR extends WaypointChangeRoutine {
  fixState(correctState: State, incorrectState: State) {
    incorrectState.setAltitude(correctState.getAltitude());
  }

  protected altitudeCheck(entryAltitude: number, exitAltitude: number) {
    return entryAltitude == exitAltitude;
  }

  stateCheck() {
    const entryAltitude = this.getEntryState().getAltitude();
    const exitAltitude = this.getExitState().getAltitude();
    const altitudeCheck: boolean =
      entryAltitude && exitAltitude
        ? this.altitudeCheck(entryAltitude, exitAltitude)
        : true;
    return super.stateCheck() && altitudeCheck;
  }

  getAltitude() {
    if (
      this.getEntryState().getAltitude() != null &&
      this.getExitState().getAltitude()
    ) {
      return this.getEntryState().getAltitude();
    } else {
      return null;
    }
  }

  setAltitude(newAltitude: number) {
    this.getEntryState().setAltitude(newAltitude);
    this.getEntryState().entryUpdate();
    this.getExitState().setAltitude(newAltitude);
    this.getExitState().exitUpdate();
  }

  getGroundSpeed(): number | null {
    const altitude = this.getAltitude();
    if (altitude) {
      return scienceTrueAirSpeed(altitude);
    } else {
      return null;
    }
  }

  calculateDuration() {
    if (super.calculateDuration() != null) {
      return super.calculateDuration();
    }
    const speed = this.getGroundSpeed();
    const distance = this.getHaversine();
    if (speed != null && distance != null) {
      return Math.ceil(distance / speed);
    } else {
      return null;
    }
  }
}
Routine.register('SLR', SLR);

export class Transit extends SLR {
  getGroundSpeed(): number | null {
    const altitude = this.getAltitude();
    if (altitude) {
      return transitTrueAirSpeed(altitude);
    } else {
      return null;
    }
  }

  calculateDuration() {
    if (super.calculateDuration() != null) {
      return super.calculateDuration();
    }
    const speed = this.getGroundSpeed();
    const distance = this.getHaversine();
    if (speed != null && distance != null) {
      return Math.ceil(distance / speed);
    } else {
      return null;
    }
  }
}
Routine.register('Transit', Transit);
