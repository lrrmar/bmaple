import CompositeRoutine from '../routines/CompositeRoutine';
import { routineRegistry } from '../routines/routineRegistry';
import { RoutineJson, isRoutineJson } from './types';

export const routineFromJson = (json: RoutineJson) => {
  const routineClass = routineRegistry[json.routine];
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
