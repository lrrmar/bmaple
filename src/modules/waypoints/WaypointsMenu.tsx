import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { SemanticICONS, Input, Label, Button } from 'semantic-ui-react';

import {} from '../waypoints/waypointSlice';

import DropDownList from '../../features/DropDownList';
import {
  request,
  update,
  selectCache,
  CacheElement,
} from '../../mapping/cacheSlice';
import {
  isPendingWaypoint,
  isEntryWaypoint,
  EntryWaypoint,
  Waypoint,
} from './WaypointSourceLayer';

import {
  updateHighlightedWaypoints,
  selectHighlightedWaypoints,
} from './waypointSlice';

const MenuItem = (
  waypoint: Waypoint & CacheElement,
  open: string | null,
  setOpen: Dispatch<SetStateAction<string | null>>,
  hovered: string | null,
  setHovered: Dispatch<SetStateAction<string | null>>,
) => {
  const id = waypoint.id;
  const style: React.CSSProperties = {
    borderColor: 'white',
    backgroundColor: '#101010',
    margin: '1px',
  };

  const openStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  };

  if (id) {
    return (
      <div
        key={id}
        style={style}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          onClick={() => {
            if (id === open) {
              setOpen(null);
            } else {
              setHovered(null);
              setOpen(id);
            }
          }}
        >
          {waypoint.name}
        </div>
        {id === open && (
          <div>
            <WaypointForm waypoint={waypoint} setOpen={setOpen} />
          </div>
        )}
      </div>
    );
  }
};

const WaypointForm = ({
  waypoint,
  setOpen,
}: {
  waypoint: Waypoint & CacheElement;
  setOpen: Dispatch<SetStateAction<string | null>>;
}) => {
  const labelStyle: React.CSSProperties = {
    minWidth: '52px',
    textAlign: 'center',
  };
  const inputStyle: React.CSSProperties = {
    minWidth: '48px',
  };
  const dispatch = useDispatch();
  const [wp, setWp] = useState<(Waypoint & CacheElement) | null>(waypoint);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Label style={labelStyle} for="name input">
          Name
        </Label>
        <Input
          id="name"
          type="text"
          style={inputStyle}
          defaultValue={waypoint.name}
          placeholder={'Name'}
          onChange={(e, data) => {
            if (wp) {
              const newWaypoint = { ...wp };
              newWaypoint['name'] = data.value;
              setWp(newWaypoint);
            }
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <Label style={labelStyle} for="time input">
          Time
        </Label>
        <Input
          id="time input"
          type="text"
          style={inputStyle}
          defaultValue={waypoint.time}
          placeholder={'Time'}
          onChange={(e, data) => {
            if (wp) {
              const newWaypoint = { ...wp };
              newWaypoint['time'] = data.value;
              setWp(newWaypoint);
            }
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <Label style={labelStyle} for="lat input">
          Lat
        </Label>
        <Input
          id="lat input"
          type="text"
          style={inputStyle}
          defaultValue={waypoint.latitude.toPrecision(4)}
          placeholder={'Latitude'}
          onChange={(e, data) => {
            if (wp) {
              const newWaypoint = { ...wp };
              newWaypoint['latitude'] = parseFloat(data.value);
              setWp(newWaypoint);
            }
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <Label style={labelStyle} for="lon input">
          Lon
        </Label>
        <Input
          id="lon input"
          type="text"
          style={inputStyle}
          defaultValue={waypoint.longitude.toPrecision(4)}
          placeholder={'Longitude'}
          onChange={(e, data) => {
            if (wp) {
              const newWaypoint = { ...wp };
              newWaypoint['longitude'] = parseFloat(data.value);
              setWp(newWaypoint);
            }
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <Button
          id="submit"
          style={inputStyle}
          onClick={() => {
            if (wp) dispatch(update(wp));
            setOpen(null);
          }}
        />
      </div>
    </div>
  );
};

const WaypointsMenu = () => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [waypointComponents, setWaypointComponents] = useState<
    React.ReactNode[]
  >([]);

  useEffect(() => {
    const waypoints: (Waypoint & CacheElement)[] = [];
    Object.keys(cache).forEach((key) => {
      const waypoint = cache[key];
      if (
        waypoint &&
        (isPendingWaypoint(waypoint) || isEntryWaypoint(waypoint))
      ) {
        waypoints.push(waypoint);
      }
    });
    const comps: React.ReactNode[] = [];
    waypoints.forEach((waypoint: Waypoint & CacheElement) => {
      if (waypoint) {
        comps.push(MenuItem(waypoint, open, setOpen, hovered, setHovered));
      }
    });
    setWaypointComponents(comps);
  }, [cache, open]);

  useEffect(() => {
    if (open) {
      dispatch(updateHighlightedWaypoints(open));
    } else {
      const toDispatch = hovered ? hovered : [];
      dispatch(updateHighlightedWaypoints(toDispatch));
    }
  }, [open, hovered]);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };
  return <div style={style}>{waypointComponents}</div>;
};
export default WaypointsMenu;
