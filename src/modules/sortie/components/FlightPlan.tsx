import React, { useState, useEffect, useRef } from "react";

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';
import {
  updateFlightPlan,
  updateWaypoints
} from '../sortieSlice';
import { type RoutineSequence } from "../lib/JsonParser";

import {
  State,
  WaypointRegistry,
  CompositeRoutine,
  cranfieldTakeOffEntryState,
  CranfieldTakeOff,
  SLR,
} from "../lib/Routine";

import {
 selectClickEvent
} from '../../../mapping/mapSlice';

import { OptionProp, OptionsMenu } from "./OptionsMenu";

import Maneuvre from "./Maneuvre";
const FlightPlan = () => {

  const dispatch = useDispatch();
  const [openManeuvre, setOpenManeuvre] = useState<number | null>(null);
  const [maneuvres, setManeuvres] = useState<React.ReactNode[]>([]);
  const [allDurations, setAllDurations] = useState<{[key: number]: number | null}>({})
  const [composite, setComposite] = useState<CompositeRoutine>();
  const compositeRef = useRef<CompositeRoutine | null>(null);
  const [json, setJson] = useState<RoutineSequence | null>();
  const [options, setOptions] = useState<OptionProp[]>([]);
  const [total, setTotal] = useState<(number | null)[]>([]);
  const clickEvent = useSelector(selectClickEvent);

  useEffect(() => {
    if (!compositeRef.current) {
      // init
      const comp = new CompositeRoutine(cranfieldTakeOffEntryState);
      if (comp) setComposite(comp);
      compositeRef.current = comp;
      dispatch(updateWaypoints(WaypointRegistry.toJson()))
      }
  }, []);

  useEffect(() => {
    if (composite) {
      setManeuvres(
        composite.routines.map((routine, i) => {
          const accumulatedDuration = composite.accumulatedDurationForRoutine(routine);
          return <Maneuvre
            id={i}
            openManeuvre={openManeuvre}
            setOpenManeuvre={setOpenManeuvre}
            accumulatedDuration={accumulatedDuration}
            routine={routine}
            composite={composite}
            setComposite={setComposite}
            setOptions={setOptions}
          />
          })
      );
      const jsonSequence = composite.jsonSequence({
        bearing: true,
        includeNull: true,
      })
      if (jsonSequence) dispatch(updateFlightPlan(jsonSequence));
    }
  }, [composite, openManeuvre, allDurations]);

  useEffect(() => {
    if (maneuvres.length == 0 && composite) {
      console.log(composite.routines)
      setOptions(CranfieldTakeOff.all.map((takeoff) => {
        const display = takeoff.toString();
        return { display: display ? display : '',
          onClick: () => {
            composite.appendRoutine(takeoff);
            setComposite(composite.copy())
          }
         }
      }))
    }
  }, [maneuvres])

  useEffect(() => {
    const appendMode = true;

    if (appendMode && clickEvent && composite) {
      const clickedFeatures = clickEvent.features;
      const clickedWaypointId = clickedFeatures.find((id) => {
        return id.includes('waypoint');
      })
      if (clickedWaypointId) {
        const waypoint = WaypointRegistry.getWaypoint(clickedWaypointId.split('-')[1]);
        if (waypoint) {
          composite.appendRoutine(new SLR(
            composite.getExitState(),
            new State({waypoint: waypoint})
          ))
          setComposite(composite.copy())

        }

      }
    }
  }, [clickEvent]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "70%",
        margin: '5% 15%'
      }}
    >
      <div
        style={{
          width: "100%",
          height: "20px",
          border: "2px solid #000000",
          display: "flex",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            textAlign: "left",
          }}
        >
          Routine
        </div>
        <div
          style={{
            width: "20%",
            height: "100%",
            textAlign: "left",
          }}
        >
          Altitude
        </div>
        <div
          style={{
            width: "20%",
            height: "100%",
            textAlign: "left",
          }}
        >
          Duration
        </div>
        <div
          style={{
            width: "20%",
            height: "100%",
            textAlign: "left",
          }}
        >
          Total
        </div>
      </div>
      {maneuvres}
      <br/>
      <div style={{
        border: 'solid 2px black',
      }}
      onClick={() => composite ? alert(JSON.stringify(composite.jsonSequence())) : void(0)}
      >View JSON format</div>
      <div style={{
        border: 'solid 2px black',
      }}
      onClick={() => composite ? alert(composite.toString()) : void(0)}
      >View string</div>
      <OptionsMenu options={options} />
    </div>
  );
};

export default FlightPlan;
