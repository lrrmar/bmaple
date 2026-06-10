import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';
import CompositeRoutine from '../lib/routines/CompositeRoutine';
import WaypointRegistry from '../lib/state/WaypointRegistry';
import { Routine } from '../lib/routines/types';
import { SLR } from '../lib/routines/Runs';
import { Profile } from '../lib/routines/Profiles';
import { ToWaypoint } from '../lib/routines/ToWaypoint';
import { TakeOff } from '../lib/routines/TakeOff';
import State from '../lib/state/State';
import Waypoint from '../lib/state/Waypoint';
import { Measure } from '../lib/state/types';
import TextInputSubmit from './TextInputSubmit';
import { type OptionProp } from './OptionsMenu';
import { selectAppStyle } from '../sortieSlice';

import { Icon, SemanticICONS } from 'semantic-ui-react';

const Maneuvre = ({
  id,
  openManeuvre,
  setOpenManeuvre,
  accumulatedDuration,
  routine,
  composite,
  setComposite,
  setOptions,
  setOptionsMessage,
}: {
  id: string;
  openManeuvre: string | null;
  setOpenManeuvre: Dispatch<SetStateAction<string | null>>;
  accumulatedDuration: string;
  routine: Routine;
  composite: CompositeRoutine;
  setComposite: Dispatch<SetStateAction<CompositeRoutine | undefined>>;
  setOptions: Dispatch<SetStateAction<OptionProp[]>>;
  setOptionsMessage: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const appStyle = useSelector(selectAppStyle);
  const [display, setDisplay] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [entryAltitude, setEntryAltitude] = useState<Measure | null>(null);
  const [exitAltitude, setExitAltitude] = useState<Measure | null | undefined>(
    undefined,
  );
  const [altitudeComponents, setAltitudeComponents] = useState<React.ReactNode>(
    [],
  );

  const [open, setOpen] = useState<boolean>(false);

  let color: string = appStyle.primaryColor;
  let backgroundColor: string = '#ffffff';

  if (id == openManeuvre) {
    color = appStyle.primaryColor;
    backgroundColor = appStyle.secondaryColor;
  }

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
    if ((routine instanceof ToWaypoint || routine instanceof TakeOff) && open) {
      const defaultValue = exitAltitude
        ? exitAltitude.value.toString()
        : '...';
      setAltitudeComponents(
        <TextInputSubmit
          onSubmit={(value: string) =>
            setExitAltitude({ value: parseInt(value), unit: 'm' })
          }
          defaultValue={defaultValue}
        />,
      );
    } else if (routine.isNull()) {
      setAltitudeComponents('');
    } else {
      const defaultValue = exitAltitude
        ? exitAltitude.value.toString()
        : '...';
      setAltitudeComponents(defaultValue);
    }
  }, [entryAltitude, exitAltitude, open, composite]);

  useEffect(() => {
    if (routine instanceof TakeOff || routine instanceof ToWaypoint) {
      if (exitAltitude) {
        if (
          exitAltitude.value // remove check
        ) {
          routine.setExitAltitude(exitAltitude.value);
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
  }, [exitAltitude]);

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        color: color,
        width: '100%',
        height: open ? 'fit-content' : '2em',
        borderBottom: '2px dotted ' + appStyle.primaryColor,
        borderLeft: '2px solid ' + appStyle.primaryColor,
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
          height: open ? 'fit-content' : '2em',
          textAlign: 'left',
          borderRight: '2px dotted ' + color,
          padding: '0.5em',
        }}
      >
        <div
          style={{
            //backgroundColor: open ? "black" : "white",
            //color: open ? "white" : "black",
            width: '100%',
            //height: open ? '4em' : '2em',
            //whiteSpace: 'nowrap',
            //textOverflow: 'ellipsis',
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
            <Icon
              name="trash alternate"
              onClick={() => {
                composite.deleteRoutine(routine);
                setComposite(composite.copy());
              }}
            />
            {routine.swappableRoutines().length > 0 && (
              <Icon
                name="sync"
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
                  setOptionsMessage('Choose routine');
                }}
              />
            )}

            <Icon
              name="plus"
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
                          setOptionsMessage('Choose waypoint');
                        }
                        setOpenManeuvre(null);
                      },
                    });
                  }
                });
                setOptions(options);
                setOptionsMessage('Choose routine');
              }}
            />
          </div>
        )}
      </div>
      <div
        style={{
          width: '20%',
          height: open ? '100%' : '2em',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        {altitudeComponents}
      </div>
      <div
        style={{
          width: '20%',
          height: open ? '100%' : '2em',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        {duration ? duration : ''}
      </div>
      <div
        style={{
          width: '20%',
          height: open ? '100%' : '2em',
          borderRight: '2px dotted #000000',
          padding: '0.5em',
        }}
      >
        {accumulatedDuration}
      </div>
    </div>
  );
};

export default Maneuvre;
