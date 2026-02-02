import { SLR, Transit } from './Runs';
import { OutsideTurn, InsideTurn, RaceTrackTurn } from './Turns';
import { ProfileAscent, ProfileDescent } from './Profiles';
import NullRoutine from './NullRoutine';

export const routineRegistry: {
  [key: string]:
    | typeof SLR
    | typeof Transit
    | typeof OutsideTurn
    | typeof InsideTurn
    | typeof RaceTrackTurn
    | typeof ProfileAscent
    | typeof ProfileDescent
    | typeof NullRoutine;
} = {
  SLR: SLR,
  Transit: Transit,
  OutsideTurn: OutsideTurn,
  InsideTurn: InsideTurn,
  RaceTrackTurn: RaceTrackTurn,
  ProfileAscent: ProfileAscent,
  ProfileDescent: ProfileDescent,
  NullRoutine: NullRoutine,
};

