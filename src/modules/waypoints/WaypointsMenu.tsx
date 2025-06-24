import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { SemanticICONS, Icon, Input, Label, Button } from 'semantic-ui-react';

import {} from '../waypoints/waypointSlice';
import { ARAWaypoints, ARAWaypoint } from './ara-waypoints';

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
        value={waypoint ? waypoint.name : ''}
        defaultValue={'enter name'}
        placeholder={'Name'}
        onChange={(e, data) => {
          if (waypoint) {
            const name = data.value;
            dispatch(update({ id: waypoint.id, name: name }));
          }
        }}
        label={'Name'}
      />
      <CustomLabelledInput
        id={'time input'}
        value={waypoint ? waypoint.time : ''}
        defaultValue={'enter time'}
        placeholder={'Time'}
        onChange={(e, data) => {
          if (waypoint) {
            const time = data.value;
            dispatch(update({ id: waypoint.id, time: time }));
          }
        }}
        label={'Time'}
      />
      <CustomLabelledInput
        id={'lat input'}
        value={waypoint ? waypoint.latitude.toPrecision(5) : ''}
        defaultValue={'enter latitude'}
        placeholder={'Latitude'}
        onChange={(e, data) => {
          if (waypoint) {
            const latitude = parseFloat(data.value);
            dispatch(update({ id: waypoint.id, latitude: latitude }));
          }
        }}
        label={'Lat'}
        unit={'°N'}
      />
      <CustomLabelledInput
        id={'lon input'}
        value={waypoint ? waypoint.longitude.toPrecision(5) : ''}
        defaultValue={'enter longitude'}
        placeholder={'Longitude'}
        onChange={(e, data) => {
          if (waypoint) {
            const longitude = parseFloat(data.value);
            dispatch(update({ id: waypoint.id, longitude: longitude }));
          }
        }}
        label={'Lon'}
        unit={'°E'}
      />
      <CustomLabelledInput
        id="vert input"
        value={waypoint ? waypoint.verticalLevel : ''}
        defaultValue={'enter vertical'}
        placeholder={'Vertical'}
        onChange={(e, data) => {
          if (waypoint) {
            const verticalLevel = data.value;
            dispatch(update({ id: waypoint.id, verticalLevel: verticalLevel }));
          }
        }}
        label={'Vert'}
        unit={'hPa'}
      />
      <div style={buttonContainerStyle}>
        <Button
          id="duplicate"
          style={buttonStyle}
          onClick={() => {
            if (waypoint) {
              const newWp = { ...waypoint };
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
  const [araIds, setAraIds] = useState<string[] | null>(null);
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
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
        <Button
          id="add-ARA"
          style={{
            alignSelf: 'end',
          }}
          onClick={() => {
            // On inital render, load ARA waypoints from json file
            // and request to cache
            //
            if (araIds) {
              const toRemove = araIds.map((id) => {
                return { id: id };
              });
              dispatch(remove(toRemove));
              setAraIds(null);
            } else {
              const uids: string[] = [];
              ARAWaypoints.forEach((waypoint) => {
                const uid = 'id' + new Date().getTime();
                dispatch(
                  request({
                    source: 'waypoints',
                    id: uid,
                    ...waypoint,
                    time: null,
                    verticalLevel: null,
                  }),
                );
                uids.push(uid);
                setAraIds(uids);
              });
            }
          }}
        >
          {`${araIds ? 'hide' : 'show'} ARA`}
        </Button>
      </div>
    </div>
  );
};
export default WaypointsMenu;
