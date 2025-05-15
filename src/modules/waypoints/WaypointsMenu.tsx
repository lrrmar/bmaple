import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { SemanticICONS, Icon, Input, Label, Button } from 'semantic-ui-react';

import {} from '../waypoints/waypointSlice';

import DropDownList from '../../features/DropDownList';
import {
  request,
  update,
  remove,
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
    margin: '2px',
    padding: '8px',
    borderRadius: '4px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderColor: 'white',
    backgroundColor: '#101010',
    padding: '4px',
    fontWeight: 'bold',
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
          style={headerStyle}
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
  const inputLabelContainerStyle: React.CSSProperties = {
    display: 'flex',
    margin: '2px 0px',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  };
  const labelStyle: React.CSSProperties = {
    minWidth: '52px',
    textAlign: 'left',
  };
  const inputStyle: React.CSSProperties = {
    minWidth: '48px',
  };

  const buttonStyle: React.CSSProperties = {};
  const dispatch = useDispatch();
  const [wp, setWp] = useState<(Waypoint & CacheElement) | null>(waypoint);

  return (
    <div>
      <div style={inputLabelContainerStyle}>
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
      <div style={inputLabelContainerStyle}>
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
      <div style={inputLabelContainerStyle}>
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
      <div style={inputLabelContainerStyle}>
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

      <div style={inputLabelContainerStyle}>
        <Label style={labelStyle} for="vert input">
          Vert
        </Label>
        <Input
          id="vert input"
          type="text"
          style={inputStyle}
          defaultValue={waypoint.verticalLevel}
          placeholder={'Vertical'}
          onChange={(e, data) => {
            if (wp) {
              const newWaypoint = { ...wp };
              newWaypoint['verticalLevel'] = data.value;
              setWp(newWaypoint);
            }
          }}
        />
      </div>

      <div style={buttonContainerStyle}>
        <Button
          id="update"
          style={buttonStyle}
          onClick={() => {
            if (wp) dispatch(update(wp));
          }}
          icon
        >
          <Icon name="pencil alternate" />
        </Button>
        <Button
          id="duplicate"
          style={buttonStyle}
          onClick={() => {
            if (wp) {
              const newWp = { ...wp };
              const uid = 'id' + new Date().getTime();
              const name = newWp.name + ' duplicate';
              newWp.id = uid;
              newWp.name = name;
              delete newWp.ol_uid;
              dispatch(request(newWp));
            }
          }}
          icon
        >
          <Icon name="copy outline" />
        </Button>
        <Button
          id="remove"
          style={buttonStyle}
          onClick={() => {
            if (wp) dispatch(remove(wp));
            setOpen(null);
          }}
          icon
        >
          <Icon name="trash alternate" />
        </Button>
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
