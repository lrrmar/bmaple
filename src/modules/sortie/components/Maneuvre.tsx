import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import CompositeRoutine from '../lib/routines/CompositeRoutine';
import WaypointRegistry from '../lib/state/WaypointRegistry';
import Routine from '../lib/routines/Routine';
import { SLR } from '../lib/routines/Runs';
import { Profile } from '../lib/routines/Profiles';
import State from '../lib/state/State';
import Waypoint from '../lib/state/Waypoint';
import Measure from '../lib/state/Measure';
import TextInputSubmit from './TextInputSubmit';
import { type OptionProp } from './OptionsMenu';

const Maneuvre = ({
  id,
  openManeuvre,
  setOpenManeuvre,
  accumulatedDuration,
  routine,
  composite,
  setComposite,
  setOptions,
}: {
  id: number;
  openManeuvre: number | null;
  setOpenManeuvre: Dispatch<SetStateAction<number | null>>;
  accumulatedDuration: number;
  routine: Routine;
  composite: CompositeRoutine;
  setComposite: Dispatch<SetStateAction<CompositeRoutine | undefined>>;
  setOptions: Dispatch<SetStateAction<OptionProp[]>>;
}) => {
  const [display, setDisplay] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [entryAltitude, setEntryAltitude] = useState<Measure | null>(null);
  const [exitAltitude, setExitAltitude] = useState<Measure | null | undefined>(
    undefined,
  );
  const [altitudeComponents, setAltitudeComponents] = useState<React.ReactNode>(
    [],
  );
  const [accumulatedDurationDisplay, setAccumulatedDurationDisplay] =
    useState<string>('');

  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (openManeuvre == id) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [openManeuvre]);

  useEffect(() => {
    // on initial render, extract entry and exit altitude
    const json = routine.toJson();
    if (json) {
      const entry = json.altitude0;
      const exit = json.altitude1;

      if (entry) setEntryAltitude(entry);
      if (exit) setExitAltitude(exit);
    }
    setDisplay(routine.toString());
    setDuration(routine.calculateDuration());
  }, [composite]);

  useEffect(() => {
    if (routine instanceof SLR && open) {
      const defaultValue = entryAltitude
        ? entryAltitude.value.toString()
        : '...';
      setAltitudeComponents(
        <TextInputSubmit
          onSubmit={(value) =>
            setEntryAltitude({ value: parseInt(value), unit: 'ft' })
          }
          defaultValue={defaultValue}
        />,
      );
    } else if (routine instanceof Profile) {
      let defaultValue = '';
      defaultValue += entryAltitude
        ? `${entryAltitude.value.toString()}`
        : '...';
      defaultValue += ' -> ';
      defaultValue += exitAltitude ? `${exitAltitude.value.toString()}` : '...';
      setAltitudeComponents(defaultValue);
    } else if (routine.isNull()) {
      setAltitudeComponents('');
    } else {
      const defaultValue = entryAltitude
        ? entryAltitude.value.toString()
        : '...';
      setAltitudeComponents(defaultValue);
    }
  }, [entryAltitude, exitAltitude, open, composite]);

  useEffect(() => {
    if (routine instanceof SLR) {
      if (entryAltitude) {
        if (
          entryAltitude.value &&
          entryAltitude.value !== routine.getAltitude()
        ) {
          routine.setAltitude(entryAltitude.value);
          setComposite(composite.copy());
          setDisplay(routine.toString());
          setDuration(routine.calculateDuration());
        }
      }
    } else if (routine instanceof Profile) {
      if (entryAltitude) {
        if (entryAltitude.value) {
          routine.setEntryAltitude(entryAltitude.value);
          setDisplay(routine.toString());
          setDuration(routine.calculateDuration());
        }
      }
    }
  }, [entryAltitude]);

  useEffect(() => {
    if (routine.isNull()) {
      setBackgroundColor('#f0f0f0');
    } else if (routine.availableNextRoutines().length < 1) {
      setBackgroundColor('#f6f6f6');
    } else if (open) {
      setBackgroundColor('#a0f0f0');
    } else {
      setBackgroundColor('#ffffff');
    }
  }, [open]);

  useEffect(() => {
    if (duration && !routine.isNull()) {
      let st = '';
      // Hours
      st += `${Math.floor(accumulatedDuration / 60)}:`;
      // mins
      const mins = (accumulatedDuration % 60).toString();
      st += mins.length == 1 ? '0' + mins : mins;
      setAccumulatedDurationDisplay(st);
    } else {
      setAccumulatedDurationDisplay('');
    }
  }, [duration, accumulatedDuration]);

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        width: '100%',
        height: 'fit-content', // open ? "80px" : "20px",
        borderBottom: '2px dotted #000000',
        borderLeft: '2px dotted #000000',
        display: 'flex',
      }}
      onClick={() => {
        if (routine.isNull() || routine.availableNextRoutines().length < 1)
          return;
        if (openManeuvre !== id) {
          setOpenManeuvre(id);
        }
      }}
    >
      <div
        style={{
          width: '40%',
          height: '100%',
          textAlign: 'left',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        <div
          style={{
            //backgroundColor: open ? "black" : "white",
            //color: open ? "white" : "black",
            width: 'fit-content',
            height: 'fit-content',
          }}
          onClick={() => {
            if (routine.isNull() || routine.availableNextRoutines().length < 1)
              return;
            if (openManeuvre === id) {
              setOpenManeuvre(null);
            }
          }}
        >
          {routine.isNull() ? '' : display}
        </div>
        {open && (
          <div
            style={{
              display: 'flex',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                width: 'fit-content',
                color: 'black',
                border: 'solid 2px black',
              }}
              onClick={() => {
                composite.deleteRoutine(routine);
                setComposite(composite.copy());
              }}
            >
              Remove
            </div>

            {routine.swappableRoutines().length > 0 ? (
              <div
                style={{
                  backgroundColor: 'white',
                  width: 'fit-content',
                  color: 'black',
                  border: 'solid 2px black',
                }}
                onClick={() => {
                  const options: OptionProp[] = [];
                  routine.swappableRoutines().forEach((routine) => {
                    const display = routine.toString();
                    if (display) {
                      options.push({
                        display: display,
                        onClick: () => {
                          composite.swapRoutine(routine);
                          setComposite(composite.copy());
                        },
                      });
                    }
                  });
                  setOptions(options);
                }}
              >
                Replace
              </div>
            ) : (
              ''
            )}

            <div
              style={{
                backgroundColor: 'white',
                width: 'fit-content',
                color: 'black',
                border: 'solid 2px black',
              }}
              onClick={() => {
                const options: OptionProp[] = [];
                routine.availableNextRoutines().forEach((routine) => {
                  const display = routine.toString();
                  if (display) {
                    options.push({
                      display: display,
                      onClick: () => {
                        if (routine.calculateDuration() !== null) {
                          // We have a swappable routine
                          composite.swapRoutine(routine);
                          setComposite(composite.copy());
                        } else {
                          // We are just adding a break
                          const options: OptionProp[] = [];
                          const waypoints: Waypoint[] = Object.values(
                            WaypointRegistry.waypoints,
                          );
                          waypoints.forEach((waypoint) => {
                            const newRoutine = routine.copy();
                            newRoutine.setExitState(
                              new State({ waypoint: waypoint }),
                            );
                            options.push({
                              display: 'to ' + waypoint.name,
                              onClick: () => {
                                composite.appendRoutine(newRoutine);
                                setComposite(composite.copy());
                              },
                            });
                          });
                          setOptions(options);
                        }
                        setOpenManeuvre(null);
                      },
                    });
                  }
                });
                setOptions(options);
              }}
            >
              Add After
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          width: '20%',
          height: '100%',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        {altitudeComponents}
      </div>
      <div
        style={{
          width: '20%',
          height: '100%',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        {duration ? duration : ''}
      </div>
      <div
        style={{
          width: '20%',
          height: '100%',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        {accumulatedDurationDisplay}
      </div>
    </div>
  );
};

export default Maneuvre;
