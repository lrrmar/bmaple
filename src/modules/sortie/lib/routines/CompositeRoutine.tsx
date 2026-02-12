import Routine from './Routine';
import { Routine as _Routine } from './types';
import { WaypointChangeRoutine, BearingChangeRoutine } from './BaseRoutines';
import NullRoutine from './NullRoutine';
import { InsideTurn, RaceTrackTurn } from './Turns';
import State from '../state/State';
import { type State as _State } from '../state/types';
import { RoutineJson } from '../io/types';
import WaypointRegistry from '../state/WaypointRegistry';

export default class CompositeRoutine extends Routine {
  private routines: _Routine[] = [];

  constructor(init: _State | Routine) {
    let entry: _State;
    let exit: _State;
    let routine: _Routine | null = null;
    if (init instanceof Routine) {
      routine = init;
      entry = init.getEntryState();
      exit = init.getExitState();
    } else {
      entry = init;
      exit = new State({});
    }
    super({ entry, exit });

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

  getRoutines() {
    return this.routines;
  }

  copy() {
    this.cleanUp();
    const copy = super.copy();
    copy.routines = [...this.routines];
    return copy;
  }

  toString(durations = false) {
    if (super.toString()) return super.toString();
    let s = '';
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

  jsonSequence(flags?: {
    bearing?: boolean;
    includeNull?: boolean;
    id?: boolean;
  }): RoutineJson[] | null {
    const sequence: RoutineJson[] = [];
    this.routines.forEach((routine, i) => {
      if (flags && flags.includeNull != true) return;
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

  getStateSequence(): _State[] {
    const states: _State[] = [];
    if (this.routines.length == 0) {
      return [this.getEntryState()];
    }
    this.routines.forEach((routine) => {
      states.push(routine.getEntryState());
      states.push(routine.getExitState());
    });
    return [...new Set(states)];
  } 

  getActiveWaypoints() {
    const activeWaypoints: string[] = [];
    this.routines.forEach((routine) => {
      activeWaypoints.push(routine.getEntryState().getWaypoint().id);
      activeWaypoints.push(routine.getEntryState().getWaypoint().id);
    });
    return [...new Set(activeWaypoints)];
  }



  fixState(entry: _State, exit: _State) {
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

  // Timing
  accumulatedDurationForRoutine(routine: _Routine, toString = false) {
    if (this.routines.includes(routine)) {
      const index = this.routines.indexOf(routine);
      let i = 0;
      let accumulatedDuration = 0;
      while (i <= index) {
        const time = this.routines[i].calculateDuration();
        if (time) accumulatedDuration += time;
        i++;
      }
      if (toString) {
        let st = '';
        // Hours
        st += `${Math.floor(accumulatedDuration / 60)}:`;
        // mins
        const mins = (accumulatedDuration % 60).toString();
        st += mins.length == 1 ? '0' + mins : mins;
        return st;
      } else {
        return accumulatedDuration;
      }

    } else {
      throw new Error('Routine not in Composite');
    }
  }

  // Used in the routine array methods below to locate where in the array
  // a new routine can be added
  private getNewRoutineIndex(newRoutine: _Routine) {
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

  // PRIVATE ROUTINES ARRAY ACCESS //

  /* These private methods are the only ones allowed to actually access the
   * routines array for the composite. They are wrappers for the splice
   * array method, i.e. they find the index of the routine that is to be pushed
   * or popped, and do it if possible. They do not handle any clean up or logic
   * other than simple array add or remove.
   */

  private includeRoutine(newRoutine: _Routine) {
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
      throw new Error('New routine has no matching state within composite');
    }
  }

  private removeRoutine(routine: _Routine) {
    // Remove this routine from the composite
    if (this.routines.includes(routine)) {
      const index = this.routines.indexOf(routine);
      routine.cleanUpStates();
      this.routines.splice(index, 1);
    } else {
      throw new Error('Composite does not include this routine');
    }
  }

  ///////////////////////////

  // PUBLIC ROUTINES ARRAY ACCESS WRAPPERS //
  /* These prviate methods wrap the private routine access arrays above,
   * handling clean up and other logic such as handling state changes
   * and the need to induce new routines to be added
   */

  appendRoutine(newRoutine: _Routine) {
    // A wrapper for includeRoutine which handles the need to replicate some
    // states when a routine is added between two others

    // Check to see if routine can find a place
    if (this.getNewRoutineIndex(newRoutine) === null) {
      if (this.routines.length !== 0) {
        // Add to end of routines list
        const nullRoutine = new NullRoutine({
          entry: this.getExitState(),
          exit: newRoutine.getEntryState(),
        });
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
    let entryState: _State;
    let exitState: _State;
    let direction: 'forward' | 'backwards' = 'forward';

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
      direction = 'backwards';
    } else {
      throw new Error('This routine cannot be added to the composite');
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

    if (direction == 'forward') {
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

  swapRoutine(newRoutine: _Routine) {
    // A wrapper for includeRoutine which handles the replacement of
    // a routine currently in the routines array with a new one.

    const candidateSwaps = this.routines.filter((routine) => {
      return (
        routine.getEntryState() === newRoutine.getEntryState() &&
        routine.getExitState() === newRoutine.getExitState()
      );
    });
    if (candidateSwaps.length == 0) {
      throw new Error('Not able to swap, does not match a current routine');
    } else if (candidateSwaps.length > 1) {
      throw new Error(
        'Not able to swap, matches more than one current routine',
      );
    } else if (candidateSwaps.length == 1) {
      const toRemove = candidateSwaps.at(0);
      if (toRemove) {
        this.removeRoutine(toRemove);
        this.includeRoutine(newRoutine);
      }
    }
  }

  deleteRoutine(routine: _Routine) {
    this.removeRoutine(routine);
    this.pruneRoutines();
    this.pruneExcessTurns();
    this.injectNullRoutines();
  }

  // CLEAN UP //
  /* These private methods are used by the public routine mutation methods
   * above to ensure that the composite routine is in good health, i.e.
   * injecting or pruning turns and null routines when needed or pulling
   * in routines that are being pointed to by state.
   */

  private getBreaks() {
    // Get a list of pairs of State that do not have a connecting routine
    const breaks: [_State, _State][] = [];
    let exit: _State = this.entryState;
    let entry: _State;
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

  private injectNullRoutines() {
    // If there is a break in the chain of routines, i.e. there exists a state A
    // and state B such that there are no Routines in this composite that connect
    // A and B then inject a NullRoutine that connects them UNLESS one of these
    // routines is Null, then we can connect them
    //
    // Should induce an error if these states are still pointing to something
    // in their getExitForRoutine() or getEntryForRoutine() properties
    if (this.routines.length == 0) return;
    const breaks = this.getBreaks();
    breaks.forEach((br) => {
      const exitRoutine = br[0].getExitForRoutine();
      const entryRoutine = br[1].getEntryForRoutine();
      if (exitRoutine && entryRoutine) {
        if (exitRoutine instanceof NullRoutine) {
          exitRoutine.setExitState(br[1]);
        } else if (entryRoutine instanceof NullRoutine) {
          entryRoutine.setEntryState(br[0]);
        } else {
          this.includeRoutine(new NullRoutine({ entry: br[0], exit: br[1] }));
        }
      }
    });
  }

  private pruneRoutines() {
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

  private pullRoutines() {
    // If there is a routine that state is pointing to that is not
    // in this.routines then include it, e.g. induced by self replacements
    // in a swap from ProfileAscent to ProfileDescent or vice versa
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

  private getMissingTurnPoints() {
    // Get a list of state connected by two WaypointChangeRoutines, i.e. that
    // need to have a turn between them
    const missingTurnPoints: _State[] = [];
    for (let i = 0; i < this.routines.length - 1; i++) {
      const entryRoutine = this.routines.at(i);
      const exitRoutine = this.routines.at(i + 1);
      if (
        entryRoutine instanceof WaypointChangeRoutine &&
        exitRoutine instanceof WaypointChangeRoutine &&
        entryRoutine.getExitState().getWaypoint() ==
          exitRoutine.getEntryState().getWaypoint()
      ) {
        missingTurnPoints.push(entryRoutine.getExitState());
      }
    }
    return missingTurnPoints;
  }

  private pruneExcessTurns() {
    const turns = this.routines.filter(
      (routine) => routine instanceof BearingChangeRoutine,
    );

    turns.forEach((turn) => {
      const previousRoutine = turn.getEntryState().getExitForRoutine();
      const nextRoutine = turn.getExitState().getEntryForRoutine();
      if (
        !(
          previousRoutine &&
          nextRoutine &&
          previousRoutine instanceof WaypointChangeRoutine &&
          nextRoutine instanceof WaypointChangeRoutine
        )
      ) {
        this.removeRoutine(turn);
      }
    });
  }

  private injectMissingTurns() {
    const fullTurnMaxBearingChange = 10;
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
      const insideTurn = new TurnClass({ entry: entryState, exit: exitState });
      this.includeRoutine(insideTurn);
    });
  }

  private cleanUp() {
    this.injectNullRoutines();
    this.pullRoutines();
    this.pruneRoutines();
    this.injectMissingTurns();
    this.injectNullRoutines();
  }

  docxRoutines() {
    return this.routines.map((routine) => {
      const description = routine.toString();
      const duration = routine.calculateDuration();
      const soFar = this.accumulatedDurationForRoutine(routine, true);
      const toReturn: Record<'description' | 'duration' | 'soFar', string> = { 
        description: '',
        duration: '',
        soFar: ''
      };
      if (description) toReturn['description'] = description;
      if (duration) toReturn['duration'] = duration.toString();
      if (soFar && typeof soFar == 'string') toReturn['soFar'] = soFar;
      return toReturn;
    })
  }

  docxWaypoints() {
    const toReturn: {description: string, coords: string}[] = [];
    this.getActiveWaypoints().forEach((wp) => {
      const waypoint = WaypointRegistry.getWaypoint(wp);
      if (waypoint) {
        let description = waypoint.id;
        if (waypoint.name != waypoint.id) {
          description += ` (${waypoint.name})` ;
        }
        toReturn.push({description: description, coords: waypoint.getLatitude().toString()});
      }
    });
    return toReturn;
  }

  ////////////////////
}
