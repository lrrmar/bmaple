import Routine from './Routine';
import State from '../state/State';

export default class NullRoutine extends Routine {
  stateCheck() {
    return true;
  }

  fixState(entry: State, exit: State) {
    void 0;
  }

  toString() {
    if (super.toString()) return super.toString();
    return 'Break';
    //return `No routine between ${this.getEntryState().waypoint.name} and ${this.getExitState().waypoint.name}`;
  }

  calculateDuration() {
    super.calculateDuration();
    return null;
  }

  getAltitude() {
    return null;
  }
}
