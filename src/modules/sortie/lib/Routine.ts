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
import { scienceTrueAirSpeed, transitTrueAirSpeed } from "./utils";
import { type RoutineJson, isRoutineName, type Measure } from "./JsonParser";
import waypointImport, { WaypointData } from './waypoints';


const fullTurnMaxBearingChange = 10;
type AbstractConstructor<T = unknown> = abstract new (...args: any[]) => T;

function isSubclassOf<
  Child extends AbstractConstructor,
  Parent extends AbstractConstructor,
>(child: Child, parent: Parent): child is Child & Parent {
  let current = Object.getPrototypeOf(child);

  while (current) {
    if (current === parent) return true;
    current = Object.getPrototypeOf(current);
  }

  return false;
}


export class WaypointRegistry {
  // todo: make into a singleton
  static waypoints: { [key: string]: Waypoint } = {};
  static compositeRoutines: CompositeRoutine[] = [];
  constructor() {
    const tempWaypointSet: WaypointData[] = Object.values(waypointImport);

    tempWaypointSet.forEach((waypoint: WaypointData) => {
      WaypointRegistry.registerNewWaypoint(
        new Waypoint(
          waypoint.id,
          waypoint.name,
          waypoint.latitude,
          waypoint.longitude
        )
      );
    });
  }

  static registerCompositeRoutine(routine: CompositeRoutine) {
    this.compositeRoutines.push(routine);
  }

  static registerNewWaypoint(waypoint: Waypoint) {
    if (this.waypoints[waypoint.id] != undefined) {
      throw new Error(`Waypoint ${waypoint.name} already exists`);
    } else {
      this.waypoints[waypoint.id] = waypoint;
    }
  }

  static getActiveWaypoints() {
    const activeWaypoints: string[] = [];
    this.compositeRoutines.forEach((routine) => {
      const stateSequence = routine.getStateSequence();
      stateSequence.forEach((state: State) => {
        activeWaypoints.push(state.waypoint.name);
      });
    });
    return [...new Set(activeWaypoints)];
  }

  static getWaypoint(id: string) {
    const waypoint = this.waypoints[id];
    if (waypoint) {
      return waypoint;
    } else {
      return undefined;
    }
  }

  static getNullWaypoint() {
    return new Waypoint(
      'null' + Date.now().toString(),
      'Null',
      {'unit': 'dd', 'value': -9999},
      {'unit': 'dd', 'value': -9999},
    )
  }

  static toJson() {
    return Object.values(this.waypoints).map((waypoint) => waypoint.toJson());
  }
}

export interface State {
  waypoint: Waypoint;
  altitude: number | null;
  bearing: number | null;
  constructor(init: {
    waypoint?: Waypoint;
    altitude?: number;
    bearing?: number;
  }): void;
  isComplete(): boolean;
}

type StateConstructor = {
  waypoint?: Waypoint;
  altitude?: number;
  bearing?: number;
};

export class State implements State {
  public waypoint: Waypoint;
  public altitude: number | null = null;
  public bearing: number | null = null;

  private exitForRoutine: Routine | null = null;
  private entryForRoutine: Routine | null = null;

  constructor(init: StateConstructor) {
    if (init["waypoint"]) {
      this.waypoint = init["waypoint"];
    } else {
      this.waypoint = WaypointRegistry.getNullWaypoint();
    }
    if (init["altitude"] != null) this.setAltitude(init["altitude"]);
    if (init["bearing"] != null) this.setBearing(init["bearing"]);
  }

  public setWaypoint(waypoint: Waypoint): void {
    this.waypoint = waypoint;
  }
  public setAltitude(altitude: number): void {
    this.altitude = altitude;
  }
  public setBearing(bearing: number): void {
    this.bearing = bearing;
  }

  isNull(): boolean {
    return (
      this.waypoint.name == "Null" &&
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
      throw new Error("State is already entry for routine");
    }
  }

  setExitForRoutine(routine: Routine) {
    // set the routine for which this is the exit state
    if (this.exitForRoutine === routine) return;
    if (!this.exitForRoutine || this.exitForRoutine instanceof NullRoutine) {
      this.exitForRoutine = routine;
    } else {
      throw new Error("State is already exit for routine");
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

export interface Routine {
  duration: number | null;
  constructor(entry: State, exit: State): void;
  stateCheck(): boolean;
  timeCost(): number;
  fixState(correctState: State, incorrectState: State): void;
  entryUpdate(): void;
  exitUpdate(): void;
  //fromJson(): Routine;
}

export abstract class Routine implements Routine {
  protected entryState: State;
  protected exitState: State;
  public duration: number | null = null;
  private display: string | null = null;

  constructor(entry: State, exit?: State) {
    if (exit == undefined && entry.isNull()) {
      throw new Error("Lone entry state cannot be null");
    } else if (exit && exit.isNull() && entry.isNull()) {
      throw new Error("Entry and exit state cannot be null");
    }
    this.entryState = entry;
    if (exit) {
      this.exitState = exit;
    } else {
      // Automatically add a null exit state if none provided
      this.exitState = new State({});
    }
  }

  routineList: RoutineList = routineList;

  copy() {
    const copy = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
    );
    return copy;
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
        throw new Error("Incorrect state");
      }
    }
  }

  stateCheck(): boolean {
    throw new Error("Not implemented");
  }
  //////////////////////////

  isNull() {
    return this instanceof NullRoutine;
  }
  // Views

  toString(): string | null {
    if (this.display) {
      return this.display;
    } else {
      return null;
    }
  }

  toJson(flags?: {bearing?: boolean}): RoutineJson | null {
    const routineName = this.constructor.name;
    if (isRoutineName(routineName)) {
      const altitude0 = this.getEntryState().altitude;
      const altitude1 = this.getExitState().altitude;
      const waypoint0 = this.getEntryState().waypoint.id;
      const waypoint1 = this.getExitState().waypoint.id;
      const bearing0 = this.getEntryState().bearing;
      const bearing1 = this.getExitState().bearing;
      const duration = this.calculateDuration();
      let json: RoutineJson = {
        routine: routineName,
        waypoint0: waypoint0,
      };

      if (waypoint0 != waypoint1) {
        json["waypoint1"] = waypoint1;
      }

      if (altitude0 != null) {
        json["altitude0"] = { value: altitude0, unit: "ft" };
      }

      if (altitude1 != null && altitude0 != altitude1) {
        json["altitude1"] = { value: altitude1, unit: "ft" };
      }

      if (flags && flags.bearing && bearing0 != null) {
        json["bearing0"] = { value: bearing0, unit: "degrees" };
      }

      if (flags && flags.bearing && bearing1 != null && bearing0 != bearing1) {
        json["bearing1"] = { value: bearing1, unit: "degrees" };
      }

      if (duration != null) {
        json["duration"] = { value: duration, unit: "minutes" };
      }

      return json;
    } else {
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

  fixState(correctState: State, incorrectState: State): void {
    throw new Error("Not implemented");
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

  setEntryState(state: State) {
    this.entryState = state;
  }

  setExitState(state: State) {
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

  permittedNextRoutineClasses(): RoutineList {
    // Defines which types of routine are allowed to follow from eachother
    throw new Error("Not implemented");
  }

  permittedPreviousRoutineClasses(): RoutineList {
    return this.permittedNextRoutineClasses(); // for now all are symmetrical
  }

  equivalentRoutineClasses() {
    // Provides a list of routine classes that are equivalent to the current one
    let classes: RoutineList = [];
    this.routineList
      .filter((routineClass) => routineClass.name !== this.constructor.name)
      .forEach((routineClass) => {
        try {
          const routine = new routineClass(
            this.getEntryState(),
            this.getExitState(),
          );
          if (routine.stateCheck()) {
            classes.push(routineClass);
          }
        } catch {
          void 0;
        }
      });
    return classes;
  }

  swappableRoutines(): Routine[] {
    // Provides a list of routine instances that are equivalent to the current one
    return this.equivalentRoutineClasses().map((routineClass) => {
      return new routineClass(this.getEntryState(), this.getExitState());
    });
  }

  availableNextRoutines() {
    // returns a list of possible next routines instances
    let nextRoutines: Routine[] = [];

    // Get current next routine and if null give option to swap for a valid
    // next routine

    const currentNextRoutine = this.getExitState().getEntryForRoutine();
    if (currentNextRoutine && currentNextRoutine.isNull()) {
      nextRoutines = currentNextRoutine.swappableRoutines();
    }

    // Create instances that exit to null state of ALL possible permitted
    // routines that follow this one
    this.permittedNextRoutineClasses().forEach((routineClass) => {
      nextRoutines.push(new routineClass(this.getExitState()));
    });
    const availableNextRoutines: Routine[] = [];
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
    let previousRoutines: Routine[] = [];

    // Get current previous routine and if it exists create instances of all
    // swappable routines i.e. options for keeping state the same but swapping
    // the routine that connects them
    const currentPreviousRoutine = this.getEntryState().getExitForRoutine();
    if (currentPreviousRoutine) {
      previousRoutines = currentPreviousRoutine.swappableRoutines();
    }

    // Create instances that exit to null state of ALL possible permitted
    // routines that follow this one
    this.permittedPreviousRoutineClasses().forEach((routineClass) => {
      previousRoutines.push(
        new routineClass(new State({}), this.getEntryState()),
      );
    });
    const availablePreviousRoutines: Routine[] = [];
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
    throw new Error("Not implemented");
  }
}

class BearingChangeRoutine extends Routine {
  stateCheck() {
    return this.entryState.waypoint == this.exitState.waypoint;
  }

  // state specific
  permittedNextRoutineClasses() {
    // None allowed
    return [];
  }

  fixRoutineToState() {
    // Similar to WaypointChangeRoutine
    super.fixRoutineToState();
    const previousRoutine = this.getEntryState().getExitForRoutine();
    const nextRoutine = this.getExitState().getEntryForRoutine();

    if (previousRoutine && previousRoutine instanceof WaypointChangeRoutine) {
      this.getEntryState().bearing = previousRoutine.getExitBearing();
    }
    if (nextRoutine && nextRoutine instanceof WaypointChangeRoutine) {
      this.getExitState().bearing = nextRoutine.getEntryBearing();
    }
  }

  static fromJson(json: RoutineJson) {
    let entryStateInfo: StateConstructor = {};

    // waypoint errors
    const waypoint0 = WaypointRegistry.getWaypoint(json.waypoint0);
    if (waypoint0) {
      entryStateInfo["waypoint"] = waypoint0;
    } else {
      throw new Error(`Waypoint ${json.waypoint0} is not registered`);
    }
    if (json.waypoint1) {
      throw new Error(`${this.constructor.name} requires a single waypoint.`);
    }

    // altitude
    const altitude0 = json.altitude0;
    if (altitude0) {
      entryStateInfo["altitude"] = altitude0["value"];
    }

    if (json.altitude1) {
      throw new Error(`${this.constructor.name} requires a single altitude.`);
    }

    // Matching since BearingChangeRoutines do not change waypoint or altitude
    const entryState = new State(entryStateInfo);
    const exitState = new State(entryStateInfo);

    const routine = new this(entryState, exitState);
    routine.init();

    const duration = json.duration;

    if (duration != null) {
      routine.setDuration(duration.value);
    }

    return routine;
  }

  getAltitude() {
    return this.getEntryState().altitude;
  }
}

export class CompositeRoutine extends Routine {
  routineList = [SLR, Transit, OutsideTurn, InsideTurn];

  routines: Routine[] = [];

  constructor(init: State | Routine) {
    let entry: State;
    let exit: State;
    let routine: Routine | null = null;
    if (init instanceof Routine) {
      routine = init;
      entry = init.getEntryState();
      exit = init.getExitState();
    } else {
      entry = init;
      exit = new State({});
    }
    super(entry,exit);

    if (routine) {
      this.routines = [routine];
      routine.fixRoutineToState();
    }

    // Would be better to do this with injectNullRoutines, but it means
    // that we have to give this.routines inital value [], which is not
    // ideal
    //this.routines = [new NullRoutine(this.entryState, this.exitState)];
  }

  init() {
    super.init();
  }

  copy() {
    this.cleanUp();
    const copy = super.copy();
    copy.routines = [...this.routines];
    return copy;
  }
  toString(durations: boolean = false) {
    if (super.toString()) return super.toString()
    let s = "";
    this.routines.forEach((routine) => {
      s += `${routine.toString()}`;
      if (durations) {
        const t = routine.calculateDuration();
        if (t) s += `: ${t} minutes`;
      }
      s += `\n`;
    });
    if (durations) {
      const t = this.calculateDuration();
      if (t) {
        s += `Total flight duration ${t} minutes\n`;
      }
    }
    return s;
  }

  jsonSequence(flags?: {bearing?: boolean; includeNull?: boolean}): RoutineJson[] | null {
    let sequence: RoutineJson[] = [];
    this.routines.forEach((routine, i) => {
      if (routine.isNull() && flags && flags.includeNull != true) return;
      const json = routine.toJson(flags);
      if (json) {
        sequence.push(json);
      } else {
        void 0;
      }
    });
    return sequence;
  }

  stateCheck() {
    // Temporary... What would be wrong with the state?
    return true;
  }

  getEntryState() {
    // Acts as a proxy for the entry state of the first routine in the
    // composite
    const firstRoutine = this.routines[0];
    if (firstRoutine) {
      return firstRoutine.getEntryState();
    } else {
      // On construction or all routines deleted
      return this.entryState;
    }
  }

  getExitState() {
    // Acts as a proxy for the exit state of the last routine in the
    // composite
    const lastRoutine = this.routines[this.routines.length - 1];
    if (lastRoutine) {
      return lastRoutine.getExitState();
    } else {
      // On construction or all routines deleted
      return this.exitState;
    }
  }

  getStateSequence(): State[] {
    let states: State[] = [];
    if (this.routines.length == 0) {
      return [this.getEntryState()];
    }
    this.routines.forEach((routine) => {
      states.push(routine.getEntryState());
      states.push(routine.getExitState());
    });
    return [...new Set(states)];
  }

  fixState(entry: State, exit: State) {
    void 0;
  }

  calculateDuration() {
    if (super.calculateDuration() != null) {
      return super.calculateDuration();
    }
    let duration = 0;
    try {
      this.routines.forEach((routine) => {
        const dt = routine.calculateDuration();
        if (dt) {
          duration += dt;
        } else {
          throw new Error();
        }
      });
      return duration;
    } catch {
      return null;
    }
  }

  // Handling Null Routines

  getBreaks() {
    // Get a list of pairs of State that do not have a connecting routine
    const breaks: [State, State][] = [];
    let exit: State = this.entryState;
    let entry: State;
    this.routines.forEach((routine, i) => {
      entry = routine.getEntryState();
      if (exit !== entry) {
        breaks.push([exit, entry]);
      }
      exit = routine.getExitState();
    });
    if (this.getExitState() !== exit) breaks.push([exit, this.getExitState()]);
    return breaks;
  }

  injectNullRoutines() {
    // If there is a break in the chain of routines, i.e. there exists a state A
    // and state B such that there are no Routines in this composite that connect
    // A and B then inject a NullRoutine that connects them
    //
    // Should induce an error if these states are still pointing to something
    // in their getExitForRoutine() or getEntryForRoutine() properties
    if (this.routines.length == 0 ) return
    const breaks = this.getBreaks();
    breaks.forEach((br) => {
      this.includeRoutine(new NullRoutine(br[0], br[1]));
    });
  }

  pruneRoutines() {
    // Remove any routines that are hanging i.e. their entry or exit state
    // no longer points to them. NullState hanging on the end will be remove
    // by garbage collection
    this.routines.forEach((routine) => {
      const entry = routine.getEntryState();
      const exit = routine.getExitState();
      if (
        entry.getEntryForRoutine() !== routine ||
        exit.getExitForRoutine() !== routine
      ) {
        this.removeRoutine(routine);
      }

      // Remove lone turns
    });
  }

  pullRoutines() {
    // If there is a routine that state is pointing to that is not
    // in this.routines then include it, induced by self replacements
    const states = this.getStateSequence();
    states.forEach((state) => {
      const entryForRoutine = state.getEntryForRoutine();
      const exitForRoutine = state.getExitForRoutine();
      if (entryForRoutine && !this.routines.includes(entryForRoutine)) {
        this.includeRoutine(entryForRoutine);
      }
      if (exitForRoutine && !this.routines.includes(exitForRoutine)) {
        this.includeRoutine(exitForRoutine);
      }
    });
  }

  // Handling Automatic Turns Routines

  getMissingTurnPoints() {
    // Get a list of state connected by two WaypointChangeRoutines, i.e. that
    // need to have a turn between them
    const missingTurnPoints: State[] = [];
    for (let i = 0; i < this.routines.length - 1; i++) {
      const entryRoutine = this.routines.at(i);
      const exitRoutine = this.routines.at(i + 1);
      if (
        entryRoutine instanceof WaypointChangeRoutine &&
        exitRoutine instanceof WaypointChangeRoutine
      ) {
        missingTurnPoints.push(entryRoutine.getExitState());
      }
    }
    return missingTurnPoints;
  }

  // Timing
  accumulatedDurationForRoutine(routine: Routine) {
    if (this.routines.includes(routine)) {
      const index = this.routines.indexOf(routine);
      let i = 0;
      let accumulatedDuration = 0;
      while (i <= index) {
        const time = this.routines[i].calculateDuration();
        if (time) accumulatedDuration += time;
        i++;
      }
      return accumulatedDuration;
    } else {
      throw new Error('Routine not in Composite');
    }

  }

  private pruneExcessTurns() {
    const turns = this.routines.filter((routine) => routine instanceof BearingChangeRoutine);

    turns.forEach((turn) => {
      const previousRoutine = turn.getEntryState().getExitForRoutine();
      const nextRoutine = turn.getExitState().getEntryForRoutine();
      if (!(
        previousRoutine
        && nextRoutine
        && previousRoutine instanceof WaypointChangeRoutine
        && nextRoutine instanceof WaypointChangeRoutine
      )) {
        this.removeRoutine(turn);
      }
    })
  }

  injectMissingTurns() {
    const missingTurnPoints = this.getMissingTurnPoints();
    missingTurnPoints.forEach((entryState) => {
      // Duplicate the missing turn state (entry for turn routine)
      const exitState = Object.assign(
        Object.create(Object.getPrototypeOf(entryState)),
        entryState,
      );

      // Get the routine that will lead into the turn
      const previousRoutine = entryState.getExitForRoutine();

      // Get the routine that will follow the turn
      const nextRoutine = entryState.getEntryForRoutine();

      // Get bearing change if possible and update TurnClass
      let TurnClass = InsideTurn;
      if (
        previousRoutine instanceof WaypointChangeRoutine &&
        nextRoutine instanceof WaypointChangeRoutine
      ) {
        const entryBearing = previousRoutine.getExitBearing();
        const exitBearing = nextRoutine.getEntryBearing();
        if (
          entryBearing !== null &&
          exitBearing !== null &&
          Math.abs(entryBearing - ((exitBearing + 180) % 360)) <
            fullTurnMaxBearingChange
        ) {
          TurnClass = RaceTrackTurn;
        }
      }

      // remove the entryForRoutine for the entry state as this
      // will be replaced by in inside turn
      entryState.clearEntryForRoutine();

      // remove the exitForRoutine for the exit state as this
      // will be replaced by in inside turn
      exitState.clearExitForRoutine();

      // remove the entryForRoutine for the exit state as this
      // needs to be reset to the next routine
      exitState.clearEntryForRoutine();

      // Assign exitState from the InsideTurn to entryState for the following
      // WaypointChangeRoutine
      if (nextRoutine) {
        nextRoutine.setEntryState(exitState);
        nextRoutine.fixRoutineToState();
      }

      // create an inside turn creating them
      const insideTurn = new TurnClass(entryState, exitState);
      this.includeRoutine(insideTurn);
    });
  }

  swapRoutine(newRoutine: Routine) {
    // A wrapper for includeRoutine which handles the replacement of
    // a routine currently in the routines array with a new one.

    const candidateSwaps = this.routines.filter((routine) => {
      return (
        routine.getEntryState() === newRoutine.getEntryState() &&
        routine.getExitState() === newRoutine.getExitState()
      );
    });
    if (candidateSwaps.length == 0) {
      throw new Error("Not able to swap, does not match a current routine");
    } else if (candidateSwaps.length > 1) {
      throw new Error(
        "Not able to swap, matches more than one current routine",
      );
    } else if (candidateSwaps.length == 1) {
      const toRemove = candidateSwaps.at(0);
      if (toRemove) {
        this.removeRoutine(toRemove);
        this.includeRoutine(newRoutine);
      }
    }
  }

  appendRoutine(newRoutine: Routine) {
    // A wrapper for includeRoutine which handles the need to replicate some
    // states when a routine is added between two others

    // Check to see if routine can find a place
    if (this.getNewRoutineIndex(newRoutine) === null) {
      if (this.routines.length !== 0) {
        // Add to end of routines list
        const nullRoutine = new NullRoutine(
          this.getExitState(),
          newRoutine.getEntryState(),
        );
        this.includeRoutine(nullRoutine); // need to do this explicitly to account for gap in state
      }

      this.includeRoutine(newRoutine);

      // Clean up
      this.pullRoutines();
      this.pruneRoutines();
      this.injectMissingTurns();
      this.injectNullRoutines();
      return;
    }
    let entryState: State;
    let exitState: State;
    let direction: "forward" | "backwards" = "forward";

    // Find out whether this new routine leads out of (forward) or out
    // of (backward) a routine currently in the composite
    if (this.getStateSequence().includes(newRoutine.getEntryState())) {
      // the new routine leads out of a routine in the composite
      entryState = newRoutine.getEntryState();
      exitState = Object.assign(
        Object.create(Object.getPrototypeOf(entryState)),
        entryState,
      );
    } else if (this.getStateSequence().includes(newRoutine.getExitState())) {
      // the new routine leads into of a routine in the composite
      exitState = newRoutine.getExitState();
      entryState = Object.assign(
        Object.create(Object.getPrototypeOf(exitState)),
        exitState,
      );
      direction = "backwards";
    } else {
      throw new Error("This routine cannot be added to the composite");
    }

    // Get the routine that will lead into the new routine
    const previousRoutine = entryState.getExitForRoutine();

    // Get the routine that will follow the new routine
    const nextRoutine = entryState.getEntryForRoutine();

    // remove the entryForRoutine for the entry state as this
    // will be replaced by the new routine
    entryState.clearEntryForRoutine();

    // remove the exitForRoutine for the exit state as this
    // will be replaced by the new routine
    exitState.clearExitForRoutine();

    if (direction == "forward") {
      // remove the entryForRoutine for the exit state as this
      // needs to be reset to the next routine
      exitState.clearEntryForRoutine(); //????????????????????

      // Assign exitState from the InsideTurn to entryState for the following
      // WaypointChangeRoutine
      if (nextRoutine) {
        nextRoutine.setEntryState(exitState);
        nextRoutine.fixRoutineToState();
      }
    } else {
      // remove the exitForRoutine for the entry state as this
      // needs to be reset to the previous routine
      entryState.clearExitForRoutine(); //????????????????????

      // Assign exitState from the InsideTurn to entryState for the following
      // WaypointChangeRoutine
      if (previousRoutine) {
        previousRoutine.setExitState(entryState);
        previousRoutine.fixRoutineToState();
      }
    }

    // create an inside turn creating them
    this.includeRoutine(newRoutine);

    this.pullRoutines();
    this.pruneRoutines();
    this.injectMissingTurns();
    this.injectNullRoutines();
  }

  private cleanUp() {
    this.injectNullRoutines();
    this.pullRoutines();
    this.pruneRoutines();
    this.injectMissingTurns();
  }

  ///////////

  private removeRoutine(routine: Routine) {
    // Remove this routine from the composite
    if (this.routines.includes(routine)) {
      const index = this.routines.indexOf(routine);
      routine.cleanUpStates();
      this.routines.splice(index, 1);
    } else {
      throw new Error("Composite does not include this routine");
    }
  }

  deleteRoutine(routine: Routine) {
    this.removeRoutine(routine);
    this.pruneRoutines();
    this.pruneExcessTurns();
    this.injectNullRoutines();
  }

  /*replaceRoutine(oldRoutine: Routine, newRoutine: Routine) {
    // Replace this routine from the composite
    if (this.routines.includes(oldRoutine)) {
      if (oldRoutine.getEntryState() !== newRoutine.getEntryState()
      const index = this.routines.indexOf(oldRoutine);
      oldRoutine.cleanUpStates();
      this.routines.splice(index,1);
    } else {
      throw new Error('Composite does not include routine to be replace');
    }
  }*/

  private getNewRoutineIndex(newRoutine: Routine) {
    if (this.getEntryState() === newRoutine.getEntryState()) {
      return 0;
    }

    const previousRoutine = this.routines.find(
      (currentRoutine) =>
        currentRoutine.getExitState() == newRoutine.getEntryState(),
    );
    if (previousRoutine) {
      const index: number = this.routines.indexOf(previousRoutine);
      return index + 1;
    }

    const nextRoutine = this.routines.find(
      (currentRoutine) =>
        currentRoutine.getEntryState() == newRoutine.getExitState(),
    );
    if (nextRoutine) {
      const index: number = this.routines.indexOf(nextRoutine);
      return index;
    }

    if (this.getExitState() == newRoutine.getExitState()) {
      return this.routines.length;
    }
    return null;
  }

  private includeRoutine(newRoutine: Routine) {
    // Add this routine to the chain, i.e. to this.routines, but it must be added
    // after the routine who's exit is this one's entry or who's entry is this
    // ones exit, i.e. this routine must have AT LEAST one bit of state in common
    // with those already in the composite
    //
    // This is implemented by finding where (and if) the routine should sit in
    // the list of routines - the state is then attempted to be fixed on the
    // new routine, failing if that state already has competing entry or exit
    // routines already set. If this succeeds then we include the routine in
    // the routines array.
    //
    const index = this.getNewRoutineIndex(newRoutine);
    if (index !== null && !this.routines.includes(newRoutine)) {
      newRoutine.fixRoutineToState();
      this.routines.splice(index, 0, newRoutine);
    } else {
      throw new Error("New routine has no matching state within composite");
    }
  }

  waypointRegistry = WaypointRegistry;
}

class NullRoutine extends Routine {
  stateCheck() {
    return true;
  }

  fixState(entry: State, exit: State) {
    void 0;
  }

  permittedNextRoutineClasses() {
    return this.routineList.filter((routineClass) => {
      return !isSubclassOf(routineClass, BearingChangeRoutine);
    });
  }

  toString() {
    if (super.toString()) return super.toString()
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

//// bearing change routines

// turns

abstract class Turn extends BearingChangeRoutine {
  fixState(correctState: State, incorrectState: State) {
    incorrectState.waypoint = correctState.waypoint;
    incorrectState.altitude = correctState.altitude;
  }

  stateCheck() {
    return (
      super.stateCheck() && this.entryState.altitude == this.exitState.altitude
    );
  }

  bearingChange() {
    const entryBearing = this.getEntryState().bearing;
    const exitBearing = this.getExitState().bearing;
    if (entryBearing && exitBearing) {
      return Math.abs(entryBearing - exitBearing);
    } else {
      return null;
    }
  }
  toString() {
    if (super.toString()) return super.toString()
    let st = `${this.constructor.name} at ${this.getEntryState().waypoint.name}`;
    const nextRoutine = this.getExitState().getEntryForRoutine();
    if (nextRoutine) {
      if (!nextRoutine.getExitState().isNull()) {
        st += ` towards ${nextRoutine.getExitState().waypoint.name}`;
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

abstract class PartTurn extends Turn {
  // state check to handle whether a turn is too obtuse to be a part turn?
}

class InsideTurn extends PartTurn {}

class OutsideTurn extends InsideTurn {}

abstract class FullTurn extends Turn {}

class RaceTrackTurn extends FullTurn {}
class ProcedureTurn extends FullTurn {}

class FaamTurn extends FullTurn {}

// waypoint change routines

class WaypointChangeRoutine extends Routine {
  stateCheck() {
    return this.getEntryState().waypoint !== this.getExitState().waypoint;
  }

  init() {
    super.init();
  }

  toString() {
    if (super.toString()) return super.toString()
    let s = this.constructor.name;
    const entryWaypoint = this.getEntryState().waypoint.id;
    const exitWaypoint = this.getExitState().waypoint.id;
    if (entryWaypoint && entryWaypoint !== "Null") {
      s += ` from ${entryWaypoint}`;
    }
    if (exitWaypoint && exitWaypoint !== "Null") {
      s += ` to ${exitWaypoint}`;
    }
    return s;
  }

  static fromJson(json: RoutineJson) {
    let entryStateInfo: StateConstructor = {};
    let exitStateInfo: StateConstructor = {};

    // waypoint errors
    const waypoint0 = WaypointRegistry.getWaypoint(json.waypoint0);
    if (waypoint0) {
      entryStateInfo["waypoint"] = waypoint0;
    } else {
      throw new Error(`Waypoint ${json.waypoint0} is not registered`);
    }

    if (json.waypoint1) {
      const waypoint1 = WaypointRegistry.getWaypoint(json.waypoint1);
      if (waypoint1) {
        exitStateInfo["waypoint"] = waypoint1;
      } else {
        throw new Error(`Waypoint ${json.waypoint1} is not registered`);
      }
    }

    // altitude
    const altitude0 = json.altitude0;
    if (altitude0) {
      entryStateInfo["altitude"] = altitude0["value"];
    }

    const altitude1 = json.altitude1;
    if (altitude1) {
      exitStateInfo["altitude"] = altitude1["value"];
    }

    const entryState = new State(entryStateInfo);
    const exitState = new State(exitStateInfo);

    const routine = new this(entryState, exitState);
    routine.init();

    const duration = json.duration;

    if (duration != null) {
      routine.setDuration(duration.value);
    }

    return routine;
  }

  fixRoutineToState() {
    super.fixRoutineToState();
    this.getEntryState().bearing = this.getEntryBearing();
    this.getExitState().bearing = this.getExitBearing();
  }

  // class specific

  permittedNextRoutineClasses() {
    return this.routineList.filter((routineClass) => {
      return !isSubclassOf(routineClass, BearingChangeRoutine);
    });
  }

  getHaversine() {
    if (
      this.getEntryState().waypoint.name == "Null" ||
      this.getExitState().waypoint.name == "Null"
    ) {
      return null;
    }
    const lat1 = this.getEntryState().waypoint.getLatitude();
    const lon1 = this.getEntryState().waypoint.getLongitude();
    const lat2 = this.getExitState().waypoint.getLatitude();
    const lon2 = this.getExitState().waypoint.getLongitude();
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

  calculateBearing(entryState: State, exitState: State) {
    const lat1 = this.getEntryState().waypoint.getLatitude();
    const lon1 = this.getEntryState().waypoint.getLongitude();
    const lat2 = this.getExitState().waypoint.getLatitude();
    const lon2 = this.getExitState().waypoint.getLongitude();
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
    throw new Error("Not implemented");
  }
}

export class SLR extends WaypointChangeRoutine {
  fixState(correctState: State, incorrectState: State) {
    incorrectState.altitude = correctState.altitude;
  }

  protected altitudeCheck(entryAltitude: number, exitAltitude: number) {
    return entryAltitude == exitAltitude;
  }

  stateCheck() {
    const entryAltitude = this.getEntryState().altitude;
    const exitAltitude = this.getExitState().altitude;
    const altitudeCheck: boolean =
      entryAltitude && exitAltitude
        ? this.altitudeCheck(entryAltitude, exitAltitude)
        : true;
    return super.stateCheck() && altitudeCheck;
  }

  getAltitude() {
    if (this.getEntryState().altitude != null && this.getExitState().altitude) {
      return this.getEntryState().altitude;
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

class Transit extends SLR {

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

// altitude changers play a special role, due to their control over the near-
// completely free altitude variable. Similarily, they will start the chain
// of 'fixing' altitude state along the list of routines and also be the end of
// such chains as they have to stateCheck that checks altitude.

export abstract class Profile extends WaypointChangeRoutine {
  stateCheck() {
    const entryAltitude = this.getEntryState().altitude;
    const exitAltitude = this.getExitState().altitude;
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
    const entryAltitude = this.getEntryState().altitude;
    const exitAltitude = this.getExitState().altitude;
    if (super.stateCheck() && !this.stateCheck()) {
      // Inherited state succeeded, but this state check failed, therefore
      // issue in altitudes
      const replacement = new this.InverseProfileClass(
        this.getEntryState(),
        this.getExitState(),
      );
      replacement.init();
      if (!(replacement instanceof NullRoutine)) {
        this.getEntryState().clearEntryForRoutine();
        this.getExitState().clearExitForRoutine();
        replacement.fixRoutineToState();
      }
    }
  }

  init() {
    super.init();
    // verify pre-given altitudes
    const entryAltitude = this.getEntryState().altitude;
    const exitAltitude = this.getExitState().altitude;
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
    if (super.toString()) return super.toString()
    let s = super.toString();
    const exitAltitude = this.getExitState().altitude;
    if (exitAltitude) {
      s += ` at ${exitAltitude}`;
    }
    return s;
  }

  calculateDuration() {
    if (super.calculateDuration()  != null) {
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
    // new entry altitude
    const currentExitAltitude = this.getExitState().altitude;
    if (
      !currentExitAltitude ||
      this.altitudeCheck(newAltitude, currentExitAltitude)
    ) {
      this.getEntryState().setAltitude(newAltitude);
      this.getEntryState().entryUpdate();
    } else {
      throw new Error("Cannot set entry altitude");
    }
  }

  setExitAltitude(newAltitude: number) {
    // Can set if there is currently no entry altitude or it is lower/higher than the
    // new exit altitude
    const currentEntryAltitude = this.getEntryState().altitude;
    if (
      !currentEntryAltitude ||
      this.altitudeCheck(currentEntryAltitude, newAltitude)
    ) {
      this.getExitState().setAltitude(newAltitude);
      this.getExitState().exitUpdate();
    } else {
      throw new Error("Cannot set exit altitude");
    }
  }

  altitudeChange() {
    const entryAltitude = this.getEntryState().altitude;
    const exitAltitude = this.getExitState().altitude;
    if (entryAltitude != null && exitAltitude != null) {
      return Math.abs(entryAltitude - exitAltitude);
    } else {
      return null;
    }
  }

  getAltitude() {
    return [this.getEntryState().altitude, this.getExitState().altitude];
  }
}

class ProfileAscent extends Profile {
  InverseProfileClass = ProfileDescent;

  protected altitudeCheck(entryAltitude: number, exitAltitude: number) {
    return entryAltitude <= exitAltitude;
  }
}

class ProfileDescent extends Profile {
  InverseProfileClass = ProfileAscent;

  protected altitudeCheck(entryAltitude: number, exitAltitude: number) {
    return entryAltitude >= exitAltitude;
  }
}

export interface LatLonMeasure extends Measure {

unit: 'dd';
}

export interface WaypointType {
  id: string;
  name: string;
  latitude: LatLonMeasure;
  longitude: LatLonMeasure;
}

export class Waypoint implements WaypointType {
  id: string;
  name: string;
  latitude: LatLonMeasure;
  longitude: LatLonMeasure;
  constructor(
    id: string,
    name: string,
    latitude: LatLonMeasure,
    longitude: LatLonMeasure
  ) {
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }
  
  toJson(): WaypointType {
    return {
    id: this.id,
    name: this.name,
    latitude: this.latitude,
    longitude: this.longitude,
    }
  }

  getLatitude(unit = 'dd') {
    if (unit == 'dd') {
      return this.latitude.value;
    }
    /// IMPLEMENT DMS!
    return this.latitude.value
  }

  getLongitude(unit = 'dd') {
    if (unit == 'dd') {
      return this.longitude.value;
    }
    /// IMPLEMENT DMS!
    return this.longitude.value
  }
}

export type UsableRoutines =
  | typeof SLR
  | typeof Transit
  | typeof OutsideTurn
  | typeof InsideTurn
  | typeof ProfileAscent
  | typeof ProfileDescent
  | typeof NullRoutine;

type RoutineList = Array<
  | typeof SLR
  | typeof Transit
  | typeof OutsideTurn
  | typeof InsideTurn
  | typeof ProfileAscent
  | typeof ProfileDescent
  | typeof NullRoutine
>;
const routineList: RoutineList = [
  SLR,
  Transit,
  //OutsideTurn,
  //InsideTurn,
  ProfileAscent,
  ProfileDescent,
  NullRoutine,
];

export const routineRegister: {
  [key: string]:
    | typeof SLR
    | typeof Transit
    | typeof OutsideTurn
    | typeof InsideTurn
    | typeof ProfileAscent
    | typeof ProfileDescent
    | typeof NullRoutine;
} = {
  SLR: SLR,
  Transit: Transit,
  OutsideTurn: OutsideTurn,
  InsideTurn: InsideTurn,
  ProfileAscent: ProfileAscent,
  ProfileDescent: ProfileDescent,
  NullRoutine: NullRoutine,
}

const waypointReg = new WaypointRegistry();

export const cranfieldTakeOffEntryState = new State({
  waypoint: WaypointRegistry.getWaypoint('ECTG'),
  altitude: 0
})

console.log(WaypointRegistry.getWaypoint('ECTG'));
const takeOffendpoints: { [key: string]: [string, number] } = {
  'PT1': ['North Sea and the North', 65],
  'PT2': ['North Sea South', 50],
  'PT4': ['North Sea South and East Anglian coast', 40],
  'PT8': ['Thames and the South Coast', 30],
  'PT5': ['the West via the Daventry Corridor', 35],
}


class TakeOff extends ProfileAscent {}

export class CranfieldTakeOff extends TakeOff {
  private static takeOffendpoints: { [key: string]: [string, number] } = {
    'PT1': ['North Sea and the North', 65],
    'PT2': ['North Sea South', 50],
    'PT4': ['North Sea South and East Anglian coast', 40],
    'PT8': ['Thames and the South Coast', 30],
    'PT5': ['the West via the Daventry Corridor', 35],
  }

  constructor(exit: State) {
    super(cranfieldTakeOffEntryState, exit)
  }

  swappableRoutines(): Routine[] {
    return [];
  }

  static all: Routine[] = Object.keys(
    this.takeOffendpoints
  ).map((key) => {
    const takeoff = new CranfieldTakeOff(
      new State({
        waypoint: WaypointRegistry.getWaypoint(key),
        altitude: 10000,
      })
    )
    takeoff.init()
    takeoff.setDisplay(`Takeoff and transit to ${takeOffendpoints[key][0]} (${takeoff.getExitState().waypoint.name})`)
    takeoff.setDuration(takeOffendpoints[key][1])
    return takeoff;
  });

}

