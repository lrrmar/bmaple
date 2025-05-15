import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Slider from '@mui/material/Slider';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { SemanticICONS, Icon, Input, Label, Button } from 'semantic-ui-react';

import {
  request,
  update,
  remove,
  selectCache,
  CacheElement,
} from '../../mapping/cacheSlice';
import { isTrajectory, Trajectory } from './TrajectoryLayer';

import {
  updateHighlightedTrajectories,
  selectHighlightedTrajectories,
} from './trajectoriesSlice';

const MenuItem = (
  trajectory: Trajectory & CacheElement,
  open: string | null,
  setOpen: Dispatch<SetStateAction<string | null>>,
  hovered: string | null,
  setHovered: Dispatch<SetStateAction<string | null>>,
) => {
  const id = trajectory.id;
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
          {trajectory.name}
        </div>
        {id === open && <div>{'Nothing'}</div>}
      </div>
    );
  }
};

const TrajectoriesMenu = () => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [trajectoryComponents, setTrajectoryComponents] = useState<
    React.ReactNode[]
  >([]);

  useEffect(() => {
    const trajectories: (Trajectory & CacheElement)[] = [];
    Object.keys(cache).forEach((key) => {
      const trajectory = cache[key];
      if (trajectory && isTrajectory(trajectory)) {
        trajectories.push(trajectory);
      }
    });
    const comps: React.ReactNode[] = [];
    trajectories.forEach((trajectory: Trajectory & CacheElement) => {
      if (trajectory) {
        comps.push(MenuItem(trajectory, open, setOpen, hovered, setHovered));
      }
    });
    setTrajectoryComponents(comps);
  }, [cache, open]);

  useEffect(() => {
    if (open) {
      dispatch(updateHighlightedTrajectories(open));
    } else {
      const toDispatch = hovered ? hovered : [];
      dispatch(updateHighlightedTrajectories(toDispatch));
    }
  }, [open, hovered]);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };
  return <div style={style}>{trajectoryComponents}</div>;
};
export default TrajectoriesMenu;
