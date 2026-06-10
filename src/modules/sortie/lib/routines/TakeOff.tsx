import { ProfileAscent } from './Profiles';
import Routine from './Routine';
import State from '../state/State';
import type { RoutineConstructor } from './types';
import WaypointRegistry from '../state/WaypointRegistry';
export const cranfieldTakeOffEntryState = new State({
  waypoint: WaypointRegistry.getWaypoint('ECTG'),
  altitude: 0,
});

const takeOffendpoints: { [key: string]: [string, number] } = {
  PT1: ['North Sea and the North', 65],
  PT2: ['North Sea South', 50],
  PT4: ['North Sea South and East Anglian coast', 40],
  PT8: ['Thames and the South Coast', 30],
  PT5: ['the West via the Daventry Corridor', 35],
};

export class TakeOff extends ProfileAscent {

  constructor(args: RoutineConstructor) {
    const entry = args.entry.copy();
    entry.setAltitude(0);
    super({ entry: entry, exit: args.entry });
  }

  swappableRoutines(): Routine[] {
    return [];
  }  

  toString() {
    let s = this.displayName();
    const exitWaypoint = this.getExitState().getWaypoint().id;
    if (exitWaypoint && !exitWaypoint.includes('null')) {
      s += ` at ${exitWaypoint}`;
    }
    return s;
  }



}

Routine.register('TakeOff', TakeOff);
