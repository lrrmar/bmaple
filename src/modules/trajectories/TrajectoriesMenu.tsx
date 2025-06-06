import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import {
  SemanticICONS,
  Icon,
  Input,
  Label,
  Button,
  ButtonOr,
  ButtonGroup,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from 'semantic-ui-react';

import {
  request,
  update,
  Update,
  remove,
  selectCache,
  CacheElement,
  cacheSortByTime,
  InitialState,
} from '../../mapping/cacheSlice';
import { isTrajectory, Trajectory } from './TrajectoryLayer';
import { Waypoint, isEntryWaypoint } from '../waypoints/WaypointSourceLayer';
import { CustomLabelledInput } from '../waypoints/WaypointsMenu';

import {
  updateHighlightedTrajectories,
  selectTrajectories,
} from './trajectoriesSlice';

import { updateHighlightedWaypoints } from '../waypoints/waypointSlice';

const WaypointList = ({
  trajectoryId,
  waypoints,
  setHovered,
}: {
  trajectoryId: string;
  waypoints: Waypoint[];
  setHovered: Dispatch<SetStateAction<string | null>>;
}) => {
  const dispatch = useDispatch();
  const waypointIds = waypoints.map((waypoint) => waypoint.id);
  const waypointOptionStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ffffff',
    fontWeight: 'bold',
    borderRadius: '4px',
    padding: '2px',
    margin: '2px 0px',
    backgroundColor: '#333333',
  };
  return (
    <ul style={{ width: '100%', padding: '2px' }}>
      {waypoints.map((waypoint) => {
        const name = waypoint.name;
        if (name) {
          return (
            <li
              key={waypoint.id}
              onMouseEnter={() => setHovered(waypoint.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={waypointOptionStyle}>
                <div>{waypoint.name}</div>
                <Icon
                  name="window close"
                  onClick={(e: any, value: any) => {
                    // Remove waypoint ID from trajectories waypoint list
                    // in cache
                    const waypointId = waypoint.id;
                    if (waypointId) {
                      const index = waypointIds.indexOf(waypointId);
                      if (index > -1) {
                        const updatedWaypointIds = [...waypointIds];
                        updatedWaypointIds.splice(index, 1);
                        dispatch(
                          update({
                            id: trajectoryId,
                            waypoints: updatedWaypointIds,
                          }),
                        );
                        setHovered(null);
                      }
                    }
                  }}
                />
              </div>
            </li>
          );
        } else {
          return <li key={1}></li>;
        }
      })}
    </ul>
  );
};

const WaypointMenu = ({
  trajectory,
  waypoints,
  setHovered,
}: {
  trajectory: Trajectory;
  waypoints: Waypoint[];
  setHovered: Dispatch<SetStateAction<string | null>>;
}) => {
  const cache = useSelector(selectCache);
  const dispatch = useDispatch();
  return (
    <Dropdown multiple selection placeholder={'Add waypoints'} clearable>
      <DropdownMenu>
        {waypoints.map((waypoint) => (
          <DropdownItem
            key={waypoint.id}
            value={waypoint.id}
            text={waypoint.name}
            onClick={(e: any, value: any) => {
              const waypointIds = [...trajectory.waypoints];
              if (typeof value.value === 'string') {
                waypointIds.push(value.value);
                const sortedWaypointIds = cacheSortByTime(cache, waypointIds);
                dispatch(
                  update({
                    id: trajectory.id,
                    waypoints: sortedWaypointIds,
                  }),
                );
              }
            }}
            onMouseEnter={() => setHovered(waypoint.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
const TrajectoryForm = ({ trajectory }: { trajectory: Trajectory }) => {
  const dispatch = useDispatch();
  return (
    <CustomLabelledInput
      id={'name input'}
      value={trajectory ? trajectory.name : ''}
      defaultValue={'enter name'}
      placeholder={'Name'}
      onChange={(e, data) => {
        if (trajectory) {
          const name = data.value;
          dispatch(update({ id: trajectory.id, name: name }));
        }
      }}
      label={'Name'}
    />
  );
};

const ButtonBar = ({
  trajectory,
  setOpen,
}: {
  trajectory: Trajectory;
  setOpen: Dispatch<SetStateAction<string | null>>;
}) => {
  const dispatch = useDispatch();
  // Temp, for download
  const cache = useSelector(selectCache);
  const trajectoryWaypoints = trajectory.waypoints.map((id) => {
    return cache[id];
  });
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '2px 0px',
    padding: '2px',
  };

  return (
    <div style={buttonContainerStyle}>
      <Button
        id="duplicate"
        onClick={() => {
          if (trajectory) {
            const newTrajectory = { ...trajectory };
            const uid = 'id' + new Date().getTime();
            const name = newTrajectory.name + ' duplicate';
            newTrajectory.id = uid;
            newTrajectory.name = name;
            dispatch(request(newTrajectory));
          }
        }}
        icon
      >
        <Icon name="copy outline" />
      </Button>
      <Button
        id="remove"
        onClick={() => {
          const conf = confirm(`Remove trajectory: '${trajectory.name}'?`);
          if (conf) {
            dispatch(remove({ id: trajectory.id }));
          }
        }}
        icon
      >
        <Icon name="trash alternate" />
      </Button>
      <Button
        id="download"
        onClick={() => {
          const waypointsForJson = trajectoryWaypoints.map((waypoint) => {
            return {
              name: waypoint.name,
              latitude: waypoint.latitude,
              longitude: waypoint.longitude,
              verticalLevel: waypoint.verticalLevel,
              verticalUnits: waypoint.verticalUnits,
              time: waypoint.time,
            };
          });
          console.log(waypointsForJson);
          const trajectoryForJson = {
            name: trajectory.name,
            waypoints: waypointsForJson,
          };
          const blob = new Blob([JSON.stringify(trajectoryForJson)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${trajectory.name}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        icon
      >
        <Icon name="download" />
      </Button>
    </div>
  );
};

const MenuItem = (
  trajectory: Trajectory & CacheElement,
  currentTrajectoryWaypoints: Waypoint[],
  allWaypoints: Waypoint[],
  open: string | null,
  setOpen: Dispatch<SetStateAction<string | null>>,
  hoveredTrajectories: string | null,
  setHoveredTrajectories: Dispatch<SetStateAction<string | null>>,
  hoveredWaypoints: string | null,
  setHoveredWaypoints: Dispatch<SetStateAction<string | null>>,
  setToUpdate: Dispatch<SetStateAction<Update | null>>,
  cache: InitialState,
) => {
  const id = trajectory.id;

  const notCurrentTrajectoryWaypoints = allWaypoints.filter((waypoint) => {
    return !currentTrajectoryWaypoints.includes(waypoint);
  });

  const style: React.CSSProperties = {
    borderColor: 'white',
    backgroundColor: '#101010',
    margin: '2px',
    padding: '8px',
    borderRadius: '4px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flexStart',
    alignItems: 'center',
    borderColor: 'white',
    backgroundColor: '#101010',
    color: 'white',
    padding: '4px',
    fontWeight: 'bold',
  };

  const openStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '2px 0px',
    padding: '2px',
  };

  const buttonStyle: React.CSSProperties = {};

  return (
    <div>
      {id && (
        <div
          key={id}
          style={style}
          onMouseEnter={() => setHoveredTrajectories(id)}
          onMouseLeave={() => setHoveredTrajectories(null)}
        >
          <div
            style={headerStyle}
            onClick={() => {
              if (id === open) {
                setOpen(null);
              } else {
                setHoveredTrajectories(null);
                setOpen(id);
              }
            }}
          >
            {id === open ? (
              <Icon size="large" name={'caret square down'} />
            ) : (
              <p>{trajectory.name}</p>
            )}
          </div>
          {id === open && (
            <div>
              <TrajectoryForm trajectory={trajectory} />
              <br></br>
              <div style={{ fontWeight: 'bold' }}>{'Waypoints'}</div>
              <WaypointMenu
                trajectory={trajectory}
                waypoints={notCurrentTrajectoryWaypoints}
                setHovered={setHoveredWaypoints}
              />
              <WaypointList
                trajectoryId={id}
                waypoints={currentTrajectoryWaypoints}
                setHovered={setHoveredWaypoints}
              />
              <br></br>
              <ButtonBar trajectory={trajectory} setOpen={setOpen} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TrajectoriesMenu = () => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const allTrajectories = useSelector(selectTrajectories);
  const [hoveredTrajectories, setHoveredTrajectories] = useState<string | null>(
    null,
  );
  const [hoveredWaypoints, setHoveredWaypoints] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [trajectoryComponents, setTrajectoryComponents] = useState<
    React.ReactNode[]
  >([]);
  const [toUpdate, setToUpdate] = useState<Update | null>(null);

  useEffect(() => {
    const trajectoryCacheEntries: (Trajectory & CacheElement)[] = [];
    const trajectoryWaypoints: Waypoint[][] = [];
    const allWaypoints: Waypoint[] = [];
    Object.keys(cache).forEach((id) => {
      const cacheEntry = cache[id];
      if (cacheEntry && isTrajectory(cacheEntry)) {
        // Get all trajectories and their corresponding waypoints
        // from the cache
        const waypointIds = cacheEntry.waypoints;
        const waypoints: Waypoint[] = [];
        waypointIds.forEach((id) => {
          const a = cache[id];
          if (a && isEntryWaypoint(a)) {
            waypoints.push(a);
          }
        });
        trajectoryWaypoints.push(waypoints);
        trajectoryCacheEntries.push(cacheEntry);
      }
    });

    Object.keys(cache).forEach((key) => {
      // Get all waypoints to pass to menu
      const cacheEntry = cache[key];
      if (cacheEntry && isEntryWaypoint(cacheEntry)) {
        allWaypoints.push(cacheEntry);
      }
    });
    const comps: React.ReactNode[] = [];
    for (let i = 0; i < trajectoryCacheEntries.length; i++) {
      const trajectory = trajectoryCacheEntries[i];
      const waypoints = trajectoryWaypoints[i];
      if (trajectory) {
        comps.push(
          MenuItem(
            trajectory,
            waypoints,
            allWaypoints,
            open,
            setOpen,
            hoveredTrajectories,
            setHoveredTrajectories,
            hoveredWaypoints,
            setHoveredWaypoints,
            setToUpdate,
            cache,
          ),
        );
      }
    }
    setTrajectoryComponents(comps);
  }, [cache, open]);

  useEffect(() => {
    if (open) {
      dispatch(updateHighlightedTrajectories(open));
    } else {
      const toDispatch = hoveredTrajectories ? hoveredTrajectories : [];
      dispatch(updateHighlightedTrajectories(toDispatch));
    }
  }, [open, hoveredTrajectories]);

  useEffect(() => {
    if (open) {
      const toDispatch = hoveredWaypoints ? hoveredWaypoints : [];
      dispatch(updateHighlightedWaypoints(toDispatch));
    }
  }, [open, hoveredWaypoints]);

  useEffect(() => {
    if (toUpdate) dispatch(update(toUpdate));
  }, [toUpdate]);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };
  return (
    <div style={style}>
      {trajectoryComponents}
      <Button
        id="duplicate"
        style={{
          alignSelf: 'end',
        }}
        onClick={() => {
          const uid = 'id' + new Date().getTime();
          const trajectory = {
            id: uid,
            name: 'blank',
            source: 'trajectories',
            waypoints: [],
          };
          dispatch(request(trajectory));
        }}
        icon
      >
        <Icon name="plus" />
      </Button>
    </div>
  );
};
export default TrajectoriesMenu;
