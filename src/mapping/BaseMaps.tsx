import React, { useState, useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';

import { updateBaseMaps, selectBaseMapId } from './mapSlice';

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

const BaseMaps = ({ children }: Props) => {
  const dispatch = useDispatch();
  const baseMapId: string | null = useSelector(selectBaseMapId);
  const [selectedBaseMap, setSelectedBaseMap] =
    useState<React.ReactNode | null>(null);
  useEffect(() => {
    const idList: string[] | null | undefined = React.Children.map(
      children,
      (el) => {
        if (React.isValidElement<{ id: string }>(el)) {
          const id: string = el.props.id;
          return id;
        }
      },
    );
    if (idList) dispatch(updateBaseMaps(idList));
  }, []);

  useEffect(() => {
    React.Children.forEach(children, (el) => {
      if (React.isValidElement<{ id: string }>(el)) {
        if (el.props.id === baseMapId) setSelectedBaseMap(el);
      }
    });
  }, [baseMapId]);
  return <div className="BaseMaps">{selectedBaseMap}</div>;
};

export default BaseMaps;
