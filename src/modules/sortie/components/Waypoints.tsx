import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';

import {
  selectWaypoints,
  selectHighlightedFeatures,
  updateHighlightedFeatures,
  selectActiveWaypoints,
  selectAppStyle,
  updateWaypoints,
} from '../sortieSlice';

import { type Waypoint } from '../lib/state/types';
import WaypointRegistry from '../lib/state/WaypointRegistry';
import TextInputSubmit from './TextInputSubmit';

const Display = ({
  waypoint,
  active,
  openWaypoint,
  setOpenWaypoint,
}: {
  waypoint: Waypoint;
  active: boolean;
  openWaypoint: string | null;
  setOpenWaypoint: Dispatch<SetStateAction<string | null>>;
}) => {
  const dispatch = useDispatch();
  const appStyle = useSelector(selectAppStyle);
  const customWaypoint = !!/PT[A-B]/.exec(waypoint.id);
  let color: string = appStyle.primaryColor;
  let backgroundColor: string = '#ffffff';
  if (openWaypoint == waypoint.id) {
    color = appStyle.primaryColor;
    backgroundColor = appStyle.secondaryColor;
  } else if (active) {
    color = '#ffffff';
    backgroundColor = appStyle.primaryColor;
  }

  if (customWaypoint) {
    return (
      <div
        style={{
          borderBottom: '2px dotted ' + color,
          borderLeft: '2px solid ' + appStyle.primaryColor,
          borderRight: '2px solid ' + appStyle.primaryColor,
          color: color,
          backgroundColor: backgroundColor,
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '0.5em',
          }}
          onClick={() => {
            if (openWaypoint == waypoint.id) {
              setOpenWaypoint(null);
            } else {
              setOpenWaypoint(waypoint.id);
            }
          }}
        >
          <div>{`${waypoint.id} - ${waypoint.name}`}</div>
        </div>
        {openWaypoint == waypoint.id && (
          <div style={{ padding: '0.5em' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '40%' }}>{'Name:'}</div>
              <div style={{ width: '60%' }}>
                <TextInputSubmit
                  defaultValue={waypoint.name}
                  onSubmit={(value: string) => {
                    waypoint.setName(value);
                    dispatch(updateWaypoints(WaypointRegistry.toJson()));
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', margin: '0.2em 0' }}>
              <div style={{ width: '40%' }}>{'Latitude:'}</div>
              <div style={{ width: '60%' }}>
                <TextInputSubmit
                  defaultValue={waypoint.latitude.value.toString()}
                  onSubmit={(value: string) => {
                    waypoint.setLatitude(parseFloat(value));
                    dispatch(updateWaypoints(WaypointRegistry.toJson()));
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '40%' }}>{'Longitude:'}</div>
              <div style={{ width: '60%' }}>
                <TextInputSubmit
                  defaultValue={waypoint.longitude.value.toString()}
                  onSubmit={(value: string) => {
                    waypoint.setLongitude(parseFloat(value));
                    dispatch(updateWaypoints(WaypointRegistry.toJson()));
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div
        style={{
          borderBottom: '2px dotted ' + color,
          borderLeft: '2px solid ' + appStyle.primaryColor,
          borderRight: '2px solid ' + appStyle.primaryColor,
          color: color,
          backgroundColor: backgroundColor,
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '0.5em',
          }}
          onClick={() => {
            if (openWaypoint == waypoint.id) {
              setOpenWaypoint(null);
            } else {
              setOpenWaypoint(waypoint.id);
            }
          }}
        >
          <div>{`${waypoint.id} - ${waypoint.name}`}</div>
        </div>
        {openWaypoint == waypoint.id && !customWaypoint && (
          <div style={{ padding: '0.5em' }}>
            <div>{`Latitude: ${waypoint.latitude.value}`}</div>
            <div>{`Longitude: ${waypoint.longitude.value}`}</div>
          </div>
        )}
      </div>
    );
  }
};

const Waypoints = () => {
  const dispatch = useDispatch();
  const waypoints = useSelector(selectWaypoints);
  const activeWaypoints = useSelector(selectActiveWaypoints);
  const highlightedFeatures = useSelector(selectHighlightedFeatures);

  const [components, setComponents] = useState<React.ReactNode[]>([]);
  const [openWaypoint, setOpenWaypoint] = useState<string | null>(null);

  useEffect(() => {
    const newComponents: React.ReactNode[] = [];
    const inactiveWaypoints = waypoints
      .map((wp) => wp.id)
      .filter((wp) => !activeWaypoints.includes(wp));

    activeWaypoints.forEach((id) => {
      const wp = WaypointRegistry.getWaypoint(id);
      if (wp) {
        newComponents.push(
          <Display
            waypoint={wp}
            active={true}
            openWaypoint={openWaypoint}
            setOpenWaypoint={setOpenWaypoint}
          />,
        );
      }
    });

    inactiveWaypoints.forEach((id) => {
      const wp = WaypointRegistry.getWaypoint(id);
      if (wp) {
        newComponents.push(
          <Display
            waypoint={wp}
            active={false}
            openWaypoint={openWaypoint}
            setOpenWaypoint={setOpenWaypoint}
          />,
        );
      }
    });
    setComponents(newComponents);
  }, [waypoints, activeWaypoints, openWaypoint]);

  useEffect(() => {
    if (openWaypoint) {
      dispatch(updateHighlightedFeatures([openWaypoint]));
    } else {
      dispatch(updateHighlightedFeatures([]));
    }
  }, [openWaypoint]);

  useEffect(() => {
    const firstFeature = highlightedFeatures.at(0);
    if (firstFeature && waypoints.map((wp) => wp.id).includes(firstFeature)) {
      setOpenWaypoint(firstFeature);
    } else {
      setOpenWaypoint(null);
    }
  }, [highlightedFeatures]);

  return (
    <div className={'Page'}>
      <h1 style={{ alignSelf: 'center', margin: '1em' }}>Waypoints</h1>
      {components}
    </div>
  );
};

export default Waypoints;
