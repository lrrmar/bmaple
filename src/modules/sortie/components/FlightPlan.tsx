import React, { useState, useEffect, useRef } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';
import { updateFlightPlan, updateWaypoints } from '../sortieSlice';
import { type RoutineSequence } from '../lib/io/JsonParser';
import Routine from '../lib/routines/Routine';
import { 
  type SortieInfo,  
  AutoSortieFormKeys,
  EditSortieFormKeys
} from '../types';

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

import { OptionProp, OptionsMenu } from './OptionsMenu';

import TextInputSubmit from './TextInputSubmit';

import printSortie from '../doc/PrintSortie';

import Maneuvre from './Maneuvre';
const FlightPlan = () => {
  const dispatch = useDispatch();
  const [openManeuvre, setOpenManeuvre] = useState<number | null>(null);
  const [maneuvres, setManeuvres] = useState<React.ReactNode[]>([]);
  const [allDurations, setAllDurations] = useState<{
    [key: number]: number | null;
  }>({});
  const [composite, setComposite] = useState<CompositeRoutine>();
  const compositeRef = useRef<CompositeRoutine | null>(null);
  const [json, setJson] = useState<RoutineSequence | null>();
  const [options, setOptions] = useState<OptionProp[]>([]);
  const [total, setTotal] = useState<(number | null)[]>([]);

  const [sortieInfo, setSortieInfo] = useState<SortieInfo>({
    'Mission Scientist': '',
    'Author': '',
    'Approver': '',
    'Scientific Aims': '',
    'Planned T/O Time': '0900',
    'Departure Airport': '',
    'Landing Airport': '',
    'FIRS / Zones': '',
    'Weather Conditions': '',
    'Instrument Servicability': '',
    'Special Notes ': '',
  });

  const [formComponents, setFormComponents] = useState<React.ReactNode[]>([])
  const clickEvent = useSelector(selectClickEvent);
  const clickMode = useSelector(selectClickMode);

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
          const accumulatedDuration =
            composite.accumulatedDurationForRoutine(routine);
          return (
            <Maneuvre
              id={i}
              key={i}
              openManeuvre={openManeuvre}
              setOpenManeuvre={setOpenManeuvre}
              accumulatedDuration={accumulatedDuration}
              routine={routine}
              composite={composite}
              setComposite={setComposite}
              setOptions={setOptions}
            />
          );
        }),
      );
      const jsonSequence = composite.jsonSequence({
        bearing: true,
        includeNull: true,
      });
      if (jsonSequence) dispatch(updateFlightPlan(jsonSequence));
    }
  }, [composite, openManeuvre, allDurations]);

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
            { value: -clickEvent.longitude, unit: 'dd' },
          ),
        );
        dispatch(updateWaypoints(WaypointRegistry.toJson()));
      }
    }
  }, [clickEvent]);

  // Set up form 
  useEffect(() => {
    const formLines = EditSortieFormKeys.map((key) => {
      return <div>
        {key}
        <TextInputSubmit 
          defaultValue={sortieInfo[key]}
          onSubmit={(value: string) => {
            const newSortieInfo = {...sortieInfo};
            newSortieInfo[key] = value;
            setSortieInfo(newSortieInfo)
          }}
        />
      </div>
    })
    setFormComponents(formLines);
  }, [sortieInfo])

  // Handle Waypoint Changes
  useEffect(() => {
    if (composite) {
      const departureAirport = composite.getEntryState().getWaypoint().name;
      const landingAirport = composite.getExitState().getWaypoint().name;
      const newSortieInfo = {...sortieInfo};
      if (departureAirport) newSortieInfo['Departure Airport'] = departureAirport;
      if (landingAirport) newSortieInfo['Landing Airport'] = landingAirport;
      setSortieInfo(newSortieInfo);
    }
  }, [composite])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '70%',
        margin: '5% 15%',
      }}
    >
      <div>
        {formComponents}
      </div>
      <br />
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
      <OptionsMenu options={options} />
      <div onClick={() => {
        if (composite) {
          printSortie(
            sortieInfo,
            composite.docxWaypoints(),
            composite.docxRoutines(),
          )
        }
      }}>Download</div>
    </div>
  );
};

export default FlightPlan;
