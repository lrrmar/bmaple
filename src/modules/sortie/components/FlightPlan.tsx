import React, {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';
import {
  updateFlightPlan,
  selectWaypoints,
  updateWaypoints,
  selectHighlightedFeatures,
  updateHighlightedFeatures,
  selectDocxPrintFlag,
} from '../sortieSlice';
import { type SortieInfo } from '../types';

import { OptionProp } from './OptionsMenu';

import State from '../lib/state/State';
import WaypointRegistry from '../lib/state/WaypointRegistry';
import Waypoint from '../lib/state/Waypoint';
import CompositeRoutine from '../lib/routines/CompositeRoutine';
import { SLR } from '../lib/routines/Runs';
import {
  cranfieldTakeOffEntryState,
  CranfieldTakeOff,
} from '../lib/routines/TakeOff';
import { selectClickEvent, selectClickMode } from '../../../mapping/mapSlice';

//import printSortie from '../doc/PrintSortie';

import Maneuvre from './Maneuvre';
const FlightPlan = ({
  sortieInfo,
  setSortieInfo,
  setOptions,
  setOptionsMessage,
}: {
  sortieInfo: SortieInfo;
  setSortieInfo: Dispatch<SetStateAction<SortieInfo>>;
  setOptions: Dispatch<SetStateAction<OptionProp[]>>;
  setOptionsMessage: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const dispatch = useDispatch();
  const [openManeuvre, setOpenManeuvre] = useState<string | null>(null);
  const [maneuvres, setManeuvres] = useState<React.ReactNode[]>([]);
  const [allDurations, setAllDurations] = useState<{
    [key: number]: number | null;
  }>({});
  const [composite, setComposite] = useState<CompositeRoutine>();
  const compositeRef = useRef<CompositeRoutine | null>(null);

  const clickEvent = useSelector(selectClickEvent);
  const clickMode = useSelector(selectClickMode);

  const waypoints = useSelector(selectWaypoints);
  const highlightedFeatures = useSelector(selectHighlightedFeatures);

  const docxPrintFlag = useSelector(selectDocxPrintFlag);

  useEffect(() => {
    if (!compositeRef.current) {
      // init
      const comp = new CompositeRoutine(cranfieldTakeOffEntryState);
      if (comp) setComposite(comp);
      compositeRef.current = comp;
      dispatch(updateWaypoints(WaypointRegistry.toJson()));
    }
  }, []);

  useEffect(() => {
    if (composite) {
      setManeuvres(
        composite.getRoutines().map((routine, i) => {
          const accumulatedDuration = composite.accumulatedDurationForRoutine(
            routine,
            true,
          ) as string;
          return (
            <Maneuvre
              id={routine.id}
              key={routine.id}
              openManeuvre={openManeuvre}
              setOpenManeuvre={setOpenManeuvre}
              accumulatedDuration={accumulatedDuration}
              routine={routine}
              composite={composite}
              setComposite={setComposite}
              setOptions={setOptions}
              setOptionsMessage={setOptionsMessage}
            />
          );
        }),
      );
      const jsonSequence = composite.jsonSequence({
        bearing: true,
        includeNull: true,
        id: true,
      });
      if (jsonSequence) dispatch(updateFlightPlan(jsonSequence));
    }
  }, [composite, openManeuvre, allDurations]);

  useEffect(() => {
    if (openManeuvre) {
      dispatch(updateHighlightedFeatures([openManeuvre]));
    } else {
      dispatch(updateHighlightedFeatures([]));
    }
  }, [openManeuvre]);

  useEffect(() => {
    if (composite && clickEvent && clickMode == 'inspect') {
      const routineIds = composite.getRoutines().map((routine) => routine.id);
      const clickedRoutineIds = routineIds.filter((id) =>
        clickEvent.features.includes(id),
      );
      const waypointIds = waypoints.map((wp) => wp.id);

      const clickedWaypointId = waypointIds
        .filter(
          (id) =>
            clickEvent.features.includes('waypoint-' + id) &&
            !highlightedFeatures.includes(id),
        )
        .at(0);

      if (clickedWaypointId) {
        dispatch(updateHighlightedFeatures([clickedWaypointId]));
      } else {
        dispatch(updateHighlightedFeatures([]));
      }
      const toOpen = clickedRoutineIds.at(0);
      if (openManeuvre && clickedRoutineIds.includes(openManeuvre)) {
        setOpenManeuvre(null);
      } else if (toOpen) {
        setOpenManeuvre(toOpen);
      }
    }
  }, [clickEvent]);

  useEffect(() => {
    if (maneuvres.length == 0 && composite) {
      setOptions(
        CranfieldTakeOff.all.map((takeoff) => {
          const display = takeoff.toString();
          return {
            display: display ? display : '',
            onClick: () => {
              composite.appendRoutine(takeoff);
              setComposite(composite.copy());
            },
          };
        }),
      );
      setOptionsMessage('Choose take off');
    }
  }, [maneuvres]);

  useEffect(() => {
    if (clickEvent && composite) {
      if (clickMode == 'append SLR') {
        const clickedFeatures = clickEvent.features;
        const clickedWaypointId = clickedFeatures.find((id) => {
          return id.includes('waypoint');
        });
        if (clickedWaypointId) {
          const waypoint = WaypointRegistry.getWaypoint(
            clickedWaypointId.split('-')[1],
          );
          if (waypoint) {
            composite.appendRoutine(
              new SLR({
                entry: composite.getExitState(),
                exit: new State({ waypoint: waypoint }),
              }),
            );
            setComposite(composite.copy());
          }
        }
      } else if (
        clickMode == 'new waypoint' &&
        clickEvent.features.length < 1
      ) {
        const id = WaypointRegistry.getNextWaypointId();
        WaypointRegistry.registerNewWaypoint(
          new Waypoint(
            id,
            id,
            { value: clickEvent.latitude, unit: 'dd' },
            { value: clickEvent.longitude, unit: 'dd' },
          ),
        );
        dispatch(updateWaypoints(WaypointRegistry.toJson()));
      }
    }
  }, [clickEvent]);

  // Handle Waypoint Changes
  useEffect(() => {
    if (composite) {
      const departureAirport = composite.getEntryState().getWaypoint().name;
      const landingAirport = composite.getExitState().getWaypoint().name;
      const newSortieInfo = { ...sortieInfo };
      if (departureAirport)
        newSortieInfo['Departure Airport'] = departureAirport;
      if (landingAirport) newSortieInfo['Landing Airport'] = landingAirport;
      setSortieInfo(newSortieInfo);
    }
  }, [composite]);

  // Handle print request
  useEffect(() => {
    if (composite) {
      /*printSortie(
        sortieInfo,
        composite.docxWaypoints(),
        composite.docxRoutines(),
      );*/
    }
  }, [docxPrintFlag]);

  return (
    <div className={'Page'}>
      <h1 style={{ alignSelf: 'center', margin: '1em' }}>Flight Plan</h1>
      <div
        style={{
          width: '100%',
          height: '20px',
          border: '2px solid #000000',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: '40%',
            height: '100%',
            textAlign: 'left',
          }}
        >
          Routine
        </div>
        <div
          style={{
            width: '20%',
            height: '100%',
            textAlign: 'left',
          }}
        >
          Altitude
        </div>
        <div
          style={{
            width: '20%',
            height: '100%',
            textAlign: 'left',
          }}
        >
          Duration
        </div>
        <div
          style={{
            width: '20%',
            height: '100%',
            textAlign: 'left',
          }}
        >
          Total
        </div>
      </div>
      {maneuvres}
    </div>
  );
};

export default FlightPlan;
