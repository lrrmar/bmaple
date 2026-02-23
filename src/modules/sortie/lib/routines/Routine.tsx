/* hacks
 *
 * - calculateTime is not good... need to figure out whether
 *   or not to force a duration from json and how to change
 *   it if the routine states are altered
 * - setting WaypointChangeRoutine and BearingChangeRoutine to
 *   none-abstract class is lazy, but maybe okay?
 * - Currently, appendRoutine does something a bit hacky
 *   for routines without any matching state (pins to the end)
 *   this could be totally fine but is an exception to other function of the method
 */

import { type RoutineJson, isRoutineName } from '../io/types';
import type { State as _State } from '../state/types';
import State from '../state/State';
import WaypointRegistry from '../state/WaypointRegistry';
import { v4 as uuidv4 } from 'uuid';
import {
  type Routine as _Routine,
  type RoutineConstructor,
  type RoutineClassName,
  type UserRoutineClassName,
  type RoutineClass,
} from './types';

const routineClassNames: RoutineClassName[] = [
  'SLR',
  'Transit',
  'OutsideTurn',
  'InsideTurn',
  'RaceTrackTurn',
  'ProfileAscent',
  'ProfileDescent',
  'NullRoutine',
];

const userRoutineClassNames: UserRoutineClassName[] = [
  'SLR',
  'Transit',
  'ProfileAscent',
  'ProfileDescent',
  'NullRoutine',
];

export default class Routine implements _Routine {
  public id: string;
  protected entryState: _State;
  protected exitState: _State;
  public duration: number | null = null;
  private display: string | null = null;

  constructor(init: RoutineConstructor) {
    if (init.exit == undefined && init.entry.isNull()) {
      throw new Error('Lone entry state cannot be null');
    } else if (init.exit && init.exit.isNull() && init.entry.isNull()) {
      throw new Error('Entry and exit state cannot be null');
    }
    this.entryState = init.entry;
    if (init.exit) {
      this.exitState = init.exit;
    } else {
      // Automatically add a null exit state if none provided
      this.exitState = new State({});
    }
    this.id = uuidv4();
  }

  static registry: Record<RoutineClassName, RoutineClass | null> = {
    CranfieldTakeOff: null,
    SLR: null,
    Transit: null,
    OutsideTurn: null,
    InsideTurn: null,
    RaceTrackTurn: null,
    ProfileAscent: null,
    ProfileDescent: null,
    NullRoutine: null,
  };

  static register(key: RoutineClassName, subclass: RoutineClass) {
    this.registry[key] = subclass;
  }

  copy() {
    const copy = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
    );
    return copy;
  }

  static create(key: RoutineClassName, args: RoutineConstructor) {
    const SubClass = this.registry[key];
    if (!SubClass) {
      throw new Error(`Unknown type: ${key}`);
    }
    return new SubClass(args);
  }
  // Initialisation methods

  init(): void {
    this.verifyStateConstructor();
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  setDisplay(display: string) {
    this.display = display;
  }

  verifyStateConstructor() {
    if (this.getExitState().isNull()) {
      this.fixState(this.getEntryState(), this.getExitState());
    }
    if (!this.stateCheck()) {
      const error = `Routine ${this.constructor.name} not permitted between states`;
      throw new Error(error);
    }
  }

  fixRoutineToState() {
    // Not added to composite
    this.exitState.setExitForRoutine(this);
    this.entryState.setEntryForRoutine(this);
    this.fixState(this.getEntryState(), this.getExitState());
  }

  attemptToFixState() {
    if (!this.stateCheck()) {
      // try to fix the state of new routine
      this.fixState(this.getEntryState(), this.getExitState());
      if (!this.stateCheck()) {
        // Failed
        throw new Error('Incorrect state');
      }
    }
  }

  stateCheck(): boolean {
    throw new Error('Not implemented');
  }
  //////////////////////////

  isNull() {
    return this.constructor.name == 'NullRoutine';
  }
  // Views

  toString(): string | null {
    if (this.display) {
      return this.display;
    } else {
      return null;
    }
  }

  toJson(flags?: { bearing?: boolean; id?: boolean }): RoutineJson | null {
    const routineName = this.constructor.name;
    if (isRoutineName(routineName)) {
      const altitude0 = this.getEntryState().getAltitude();
      const altitude1 = this.getExitState().getAltitude();
      const waypoint0 = this.getEntryState().getWaypoint().id;
      const waypoint1 = this.getExitState().getWaypoint().id;
      const bearing0 = this.getEntryState().getBearing();
      const bearing1 = this.getExitState().getBearing();
      const duration = this.calculateDuration();
      const json: RoutineJson = {
        routine: routineName,
        waypoint0: waypoint0,
      };

      if (waypoint0 != waypoint1) {
        json['waypoint1'] = waypoint1;
      }

      if (altitude0 != null) {
        json['altitude0'] = { value: altitude0, unit: 'ft' };
      }

      if (altitude1 != null && altitude0 != altitude1) {
        json['altitude1'] = { value: altitude1, unit: 'ft' };
      }

      if (flags && flags.bearing && bearing0 != null) {
        json['bearing0'] = { value: bearing0, unit: 'degrees' };
      }

      if (flags && flags.bearing && bearing1 != null && bearing0 != bearing1) {
        json['bearing1'] = { value: bearing1, unit: 'degrees' };
      }

      if (duration != null) {
        json['duration'] = { value: duration, unit: 'minutes' };
      }

      if (flags && flags.id) {
        json['id'] = this.id;
      }

      return json;
    } else {
      console.log('is not routine name');
      return null;
    }
  }

  static fromJson(json: RoutineJson) {
    // Basic checks for waypoint errors
    if (!WaypointRegistry.getWaypoint(json.waypoint0)) {
      throw new Error(`Waypoint ${json.waypoint0} is not registered`);
    }
    if (json.waypoint1 && !WaypointRegistry.getWaypoint(json.waypoint1)) {
      throw new Error(`Waypoint ${json.waypoint1} is not registered`);
    }
  }

  calculateDuration(): number | null | undefined {
    if (this.duration != null) {
      return this.duration;
    } else {
      return null;
    }
  } // implementin class!

  ////////////////////////////

  fixState(correctState: _State, incorrectState: _State): void {
    throw new Error('Not implemented');
  }

  entryUpdate(): void {
    // entry state edited, continue forwards chain
    if (this.stateCheck()) {
      // end chain
      void 0;
    } else {
      // make change to exit
      this.fixState(this.entryState, this.exitState);
      this.exitState.exitUpdate();
    }
  }

  exitUpdate(): void {
    // exit state edited, continue backwards chain
    if (this.stateCheck()) {
      // end chain
      void 0;
    } else {
      // make change to entry
      this.fixState(this.exitState, this.entryState);
      this.entryState.entryUpdate();
    }
  }

  getEntryState() {
    return this.entryState;
  }

  getExitState() {
    return this.exitState;
  }

  setEntryState(state: _State) {
    this.entryState = state;
  }

  setExitState(state: _State) {
    this.exitState = state;
  }

  cleanUpEntryState() {
    if (this.getEntryState().getEntryForRoutine() == this) {
      this.getEntryState().clearEntryForRoutine();
    }
  }

  cleanUpExitState() {
    if (this.getExitState().getExitForRoutine() == this) {
      this.getExitState().clearExitForRoutine();
    }
  }

  cleanUpStates() {
    this.cleanUpEntryState();
    this.cleanUpExitState();
  }

  permittedNextRoutineClasses(): RoutineClass[] {
    const classes: RoutineClass[] = [];
    userRoutineClassNames.forEach((name) => {
      const routineClass = Routine.registry[name];
      if (routineClass) classes.push(routineClass);
    });
    return classes;
  }

  permittedPreviousRoutineClasses(): RoutineClass[] {
    return this.permittedNextRoutineClasses(); // for now all are symmetrical
  }

  equivalentRoutineClasses(): RoutineClass[] {
    // Provides a list of routine classes that are equivalent to the current one
    const classes: RoutineClass[] = [];
    Object.values(Routine.registry).forEach(
      (routineClass: RoutineClass | null) => {
        try {
          if (routineClass) {
            const routine = new routineClass({
              entry: this.getEntryState(),
              exit: this.getExitState(),
            });
            if (
              routine.stateCheck() &&
              routine.constructor.name != this.constructor.name
            ) {
              classes.push(routineClass);
            }
          }
        } catch {
          void 0;
        }
      },
    );
    return classes;
  }

  swappableRoutines(): _Routine[] {
    // Provides a list of routine instances that are equivalent to the current one
    return this.equivalentRoutineClasses().map((routineClass: RoutineClass) => {
      return new routineClass({
        entry: this.getEntryState(),
        exit: this.getExitState(),
      });
    });
  }

  availableNextRoutines() {
    // returns a list of possible next routines instances
    let nextRoutines: _Routine[] = [];

    // Get current next routine and if null give option to swap for a valid
    // next routine

    const currentNextRoutine = this.getExitState().getEntryForRoutine();
    if (currentNextRoutine && currentNextRoutine.isNull()) {
      nextRoutines = currentNextRoutine.swappableRoutines();
    }

    // Create instances that exit to null state of ALL possible permitted
    // routines that follow this one
    this.permittedNextRoutineClasses().forEach((routineClass) => {
      nextRoutines.push(new routineClass({ entry: this.getExitState() }));
    });
    const availableNextRoutines: _Routine[] = [];
    nextRoutines.forEach((routine) => {
      // verify each routine
      try {
        routine.init();
        availableNextRoutines.push(routine);
      } catch {
        void 0;
      }
    });
    return nextRoutines;
  }

  availablePreviousRoutines() {
    // returns a list of possible previous routines instances
    let previousRoutines: _Routine[] = [];

    // Get current previous routine and if it exists create instances of all
    // swappable routines i.e. options for keeping state the same but swapping
    // the routine that connects them
    const currentPreviousRoutine = this.getEntryState().getExitForRoutine();
    if (currentPreviousRoutine && currentPreviousRoutine.isNull()) {
      previousRoutines = currentPreviousRoutine.swappableRoutines();
    }

    // Create instances that exit to null state of ALL possible permitted
    // routines that follow this one
    this.permittedPreviousRoutineClasses().forEach((routineClass) => {
      previousRoutines.push(
        new routineClass({ entry: new State({}), exit: this.getEntryState() }),
      );
    });
    const availablePreviousRoutines: _Routine[] = [];
    previousRoutines.forEach((routine) => {
      // verify each routine
      try {
        routine.init();
        availablePreviousRoutines.push(routine);
      } catch {
        void 0;
      }
    });
    return previousRoutines;
  }

  getAltitude(): number | null | (number | null)[] {
    throw new Error('Not implemented');
  }
}
const wpr = new WaypointRegistry();
