import { ProfileAscent } from './Profiles';
import Routine from './Routine';
import State from '../state/State';
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

class TakeOff extends ProfileAscent {}

export class CranfieldTakeOff extends TakeOff {
  private static takeOffendpoints: { [key: string]: [string, number] } = {
    PT1: ['North Sea and the North', 65],
    PT2: ['North Sea South', 50],
    PT4: ['North Sea South and East Anglian coast', 40],
    PT8: ['Thames and the South Coast', 30],
    PT5: ['the West via the Daventry Corridor', 35],
  };

  constructor(exit: State) {
    super({ entry: cranfieldTakeOffEntryState, exit: exit });
  }

  swappableRoutines(): Routine[] {
    return [];
  }

  static all: Routine[] = Object.keys(this.takeOffendpoints).map((key) => {
    const takeoff = new CranfieldTakeOff(
      new State({
        waypoint: WaypointRegistry.getWaypoint(key),
        altitude: 10000,
      }),
    );
    takeoff.init();
    takeoff.setDisplay(
      `Takeoff and transit to ${takeOffendpoints[key][0]} (${takeoff.getExitState().getWaypoint().name})`,
    );
    takeoff.setDuration(takeOffendpoints[key][1]);
    return takeoff;
  });
}

Routine.register('CranfieldTakeOff', CranfieldTakeOff);
