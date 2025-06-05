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

export const CustomLabelledInput = ({
  id,
  value,
  defaultValue,
  placeholder,
  onChange,
  label,
  unit,
}: {
  id: string;
  value: string;
  defaultValue: string;
  placeholder: string;
  onChange: (e: any, data: any) => void;
  label: string;
  unit?: string;
}) => {
  const inputStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '100%',
  };

  const labelStyle: React.CSSProperties = {
    width: '52px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };
  return (
    <Input
      id={id}
      type="text"
      style={inputStyle}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      labelPosition="left"
      onChange={onChange}
    >
      <Label style={{ ...labelStyle, justifySelf: 'start' }}>{label}</Label>
      <input style={{ width: '10px' }} />
      {unit && (
        <Label for="lat input" style={{ ...labelStyle, justifySelf: 'end' }}>
          {unit}
        </Label>
      )}
    </Input>
  );
};

const MenuItem = (
  waypoint: Waypoint & CacheElement,
  open: string | null,
  setOpen: Dispatch<SetStateAction<string | null>>,
  hovered: string | null,
  setHovered: Dispatch<SetStateAction<string | null>>,
) => {
  const id = waypoint.id;
  const style: React.CSSProperties = {
    backgroundColor: '#101010',
    borderWidth: '1px',
    borderColor: '#ffffff',
    margin: '2px',
    borderRadius: '4px',
    padding: '0px 4px',
    width: '100%',
  };

  const headerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: '#101010',
    borderColor: '#ffffff',
    padding: '8px 4px',
    fontWeight: 'bold',
    borderRadius: '4px',
  };

  const openStyle: React.CSSProperties = {
    width: '100%',
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
          {id === open ? (
            <Icon size="large" name={'caret square down'} />
          ) : (
            <p>{waypoint.name}</p>
          )}
        </div>
        {id === open && (
          <div style={openStyle}>
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
  console.log('form rerender');
  const inputLabelContainerStyle: React.CSSProperties = {
    display: 'flex',
    margin: '2px',
    width: '100%',
  };

  const formStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '2px 0px',
    padding: '2px',
  };

  const buttonStyle: React.CSSProperties = {};
  const dispatch = useDispatch();
  const [wp, setWp] = useState<(Waypoint & CacheElement) | null>(waypoint);

  return (
    <div style={formStyle}>
      {/*<div style={inputLabelContainerStyle}>
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
        */}
      <CustomLabelledInput
        id={'name input'}
        value={wp ? wp.name : ''}
        defaultValue={'enter name'}
        placeholder={'Name'}
        onChange={(e, data) => {
          if (wp) {
            const newWaypoint = { ...wp };
            newWaypoint['name'] = data.value;
            setWp(newWaypoint);
          }
        }}
        label={'Name'}
      />
      <CustomLabelledInput
        id={'time input'}
        value={wp ? wp.time : ''}
        defaultValue={'enter time'}
        placeholder={'Time'}
        onChange={(e, data) => {
          if (wp) {
            const newWaypoint = { ...wp };
            newWaypoint['time'] = data.value;
            setWp(newWaypoint);
          }
        }}
        label={'Time'}
      />
      <CustomLabelledInput
        id={'lat input'}
        value={wp ? wp.latitude.toPrecision(4) : ''}
        defaultValue={'enter latitude'}
        placeholder={'Latitude'}
        onChange={(e, data) => {
          console.log(wp);
          if (wp) {
            console.log(wp);
            const newWaypoint = { ...wp };
            console.log(data);
            newWaypoint['latitude'] = parseFloat(data.value);
            console.log(newWaypoint);
            setWp(newWaypoint);
          }
        }}
        label={'Lat'}
        unit={'°N'}
      />
      <CustomLabelledInput
        id={'lon input'}
        value={wp ? wp.longitude.toPrecision(4) : ''}
        defaultValue={'eneter longitude'}
        placeholder={'Longitude'}
        onChange={(e, data) => {
          if (wp) {
            const newWaypoint = { ...wp };
            newWaypoint['longitude'] = parseFloat(data.value);
            setWp(newWaypoint);
          }
        }}
        label={'Lon'}
        unit={'°E'}
      />
      <CustomLabelledInput
        id="vert input"
        value={wp ? wp.verticalLevel : ''}
        defaultValue={'enter vertical'}
        placeholder={'Vertical'}
        onChange={(e, data) => {
          if (wp) {
            const newWaypoint = { ...wp };
            newWaypoint['verticalLevel'] = data.value;
            setWp(newWaypoint);
          }
        }}
        label={'Vert'}
        unit={'hPa'}
      />
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
  return (
    <div style={{ ...style, maxHeight: '100%' }}>
      <div style={style}>{waypointComponents}</div>
      <Button
        id="duplicate"
        style={{
          alignSelf: 'end',
        }}
        onClick={() => {
          const uid = 'id' + new Date().getTime();
          const waypoint = {
            id: uid,
            name: 'blank',
            source: 'waypoints',
            latitude: 0,
            longitude: 0,
            verticalLevel: 0,
            time: new Date().toISOString(),
          };
          dispatch(request(waypoint));
        }}
        icon
      >
        <Icon name="plus" />
      </Button>
    </div>
  );
};
export default WaypointsMenu;
