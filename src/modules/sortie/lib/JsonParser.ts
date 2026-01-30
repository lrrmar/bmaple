import example from "./ExampleJson";
import {
  type Routine,
  type State as StateType,
  State,
  CompositeRoutine,
  WaypointRegistry,
  routineRegister,
} from "./Routine";

export type Measure = {
  [key: string]: number | string;
  value: number;
  unit: string;
};
type RoutineName =
  | "SLR"
  | "Transit"
  | "OutsideTurn"
  | "InsideTurn"
  | "RaceTrackTurn"
  | "ProfileAscent"
  | "CranfieldTakeOff"
  | "ProfileDescent";

export type RoutineJson = {
  routine: RoutineName;
  waypoint0: string;
  waypoint1?: string;
  altitude0?: Measure;
  altitude1?: Measure;
  bearing0?: Measure;
  bearing1?: Measure;
  duration?: Measure;
};

export type RoutineSequence = RoutineJson[];

function isMeasure(value: unknown): value is Measure {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).value === "number" &&
    typeof (value as any).unit === "string"
  );
}

const routineNames: readonly RoutineName[] = [
  "SLR",
  "Transit",
  "OutsideTurn",
  "InsideTurn",
  "RaceTrackTurn",
  "ProfileAscent",
  "ProfileDescent",
  "CranfieldTakeOff",
];

export function isRoutineName(value: unknown): value is RoutineName {
  return (
    typeof value === "string" && routineNames.includes(value as RoutineName)
  );
}

export function isRoutineJson(value: unknown): value is RoutineJson {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as any;

  if (!isRoutineName(obj.routine)) return false;
  if (typeof obj.waypoint0 !== "string") return false;

  if (obj.waypoint1 !== undefined && typeof obj.waypoint1 !== "string") {
    return false;
  }

  if (obj.altitude0 !== undefined && !isMeasure(obj.altitude0)) {
    return false;
  }

  if (obj.altitude1 !== undefined && !isMeasure(obj.altitude1)) {
    return false;
  }

  if (obj.duration !== undefined && !isMeasure(obj.duration)) {
    return false;
  }

  return true;
}

export function isRoutineJsonArray(value: unknown): value is RoutineJson[] {
  if (!Array.isArray(value)) {
    console.log("not array");
    return false;
  }

  return value.every(isRoutineJson);
}

export const routineFromJson = (json: RoutineJson) => {
  const routineClass = routineRegister[json.routine];
  if (routineClass) {
    const routine = routineClass.fromJson(json);
    return routine;
  }
};

//////////////////////////

// Embed somewhere in class framework
export const routineFromJsonArray = (
  jsonArray: RoutineJson[],
): CompositeRoutine | null => {
  let comp: CompositeRoutine | null = null;
  jsonArray.forEach((json) => {
    if (isRoutineJson(json)) {
      const routine = routineFromJson(json);
      if (routine) {
        if (!comp) {
          // First appending
          comp = new CompositeRoutine(routine.getEntryState());
          comp.init();
        } else if (
          comp.getExitState().waypoint.name ==
            routine.getEntryState().waypoint.name &&
          comp.getExitState().altitude == routine.getEntryState().altitude
        ) {
          routine.setEntryState(comp.getExitState());
        }
        comp.appendRoutine(routine);
      }
    }
  });
  return comp;
};
