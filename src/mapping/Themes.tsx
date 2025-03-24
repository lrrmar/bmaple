import React, { useState, useEffect } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../hooks';

import {
  updateThemes,
  selectThemeId,
  updateThemeId,
  selectBaseMapId,
  updateBaseMapId,
} from './mapSlice';

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

const Themes = ({ children }: Props) => {
  const dispatch = useDispatch();
  const themeId: string | null = useSelector(selectThemeId);
  const baseMapId: string | null = useSelector(selectBaseMapId);
  const [selectedTheme, setSelectedTheme] = useState<React.ReactNode | null>(
    null,
  );
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
    if (idList) dispatch(updateThemes(idList));
  }, []);

  useEffect(() => {
    console.log(themeId);
    React.Children.forEach(children, (el) => {
      if (React.isValidElement<{ id: string }>(el)) {
        if (el.props.id === themeId) setSelectedTheme(el);
      }
    });
  }, [themeId]);
  return <div className="Themes">{selectedTheme}</div>;
};

export default Themes;
