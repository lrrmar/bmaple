import type { State } from '../state/types';
import type { RoutineJson } from '../io/types';

export type UserRoutineClassName =
  | 'CranfieldTakeOff'
  | 'SLR'
  | 'Transit'
  | 'ProfileAscent'
  | 'ProfileDescent'
  | 'NullRoutine';

export type RoutineClassName =
  | UserRoutineClassName
  | 'OutsideTurn'
  | 'InsideTurn'
  | 'RaceTrackTurn';

export type UserRoutineClassNames = Array<UserRoutineClassName>;
export type RoutineClassNames = Array<RoutineClassName>;

export interface Routine {
  duration: number | null;
  copy(): Routine;
  init(): void;
  setDuration(duration: number): void;
  setDisplay(display: string): void;
  verifyStateConstructor(): void;
  fixRoutineToState(): void;
  attemptToFixState(): void;
  stateCheck(): boolean;
  isNull(): boolean;
  toString(): string | null;
  toJson(flags?: { bearing?: boolean }): RoutineJson | null;
  calculateDuration(): number | null | undefined;
  fixState(correctState: State, incorrectState: State): void;
  entryUpdate(): void;
  exitUpdate(): void;
  getEntryState(): State;
  getExitState(): State;
  setEntryState(state: State): void;
  setExitState(state: State): void;
  cleanUpEntryState(): void;
  cleanUpExitState(): void;
  cleanUpStates(): void;
  permittedNextRoutineClasses(): RoutineClass[];
  permittedPreviousRoutineClasses(): RoutineClass[];
  equivalentRoutineClasses(): RoutineClass[];
  swappableRoutines(): Routine[];
  availableNextRoutines(): Routine[];
  availablePreviousRoutines(): Routine[];
  getAltitude(): number | null | (number | null)[];
}

export type RoutineConstructor = {
  entry: State;
  exit?: State;
};
export interface RoutineStatic {
  registry: Record<RoutineClassName, RoutineClass | null>;
  register(key: RoutineClassName, subclass: RoutineClass): void;
  create(key: RoutineClassName, args: RoutineConstructor): Routine;
  fromJson(json: RoutineJson): Routine;
}

export type RoutineClass = RoutineStatic & {
  new (con: RoutineConstructor): Routine;
};
