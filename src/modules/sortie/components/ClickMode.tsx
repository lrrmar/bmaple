import React, { useEffect, useState } from 'react';
import { Icon, SemanticICONS } from 'semantic-ui-react';
import {
  updateClickMode,
  selectClickMode,
  selectClickEvent,
} from '../../../mapping/mapSlice';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';

import { selectAppStyle } from '../sortieSlice';

const ClickModeMenu = ({
  modes,
}: {
  modes: { name: string; icon?: SemanticICONS }[];
}) => {
  const clickMode = useSelector(selectClickMode);
  const clickEvent = useSelector(selectClickEvent);
  const appStyle = useSelector(selectAppStyle);
  const [components, setComponents] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setComponents(
      modes.map((mode) => {
        const backgroundColor =
          mode.name == clickMode
            ? appStyle.secondaryColor
            : appStyle.primaryColor;
        const color =
          mode.name == clickMode
            ? appStyle.primaryColor
            : appStyle.secondaryColor;
        return (
          <ClickMode
            key={mode.name}
            mode={mode.name}
            icon={mode.icon}
            color={color}
            backgroundColor={backgroundColor}
          />
        );
      }),
    );
  }, [clickMode]);

  return (
    <div
      style={{
        borderRadius: '0.5em',
        height: 'fit-content',
        width: 'fit-content',
        display: 'flex',
      }}
    >
      {components}
    </div>
  );
};

const ClickMode = ({
  mode,
  icon,
  color,
  backgroundColor,
}: {
  mode: string;
  icon?: SemanticICONS;
  color: string;
  backgroundColor: string;
}) => {
  const dispatch = useDispatch();
  const [component, setComponent] = useState<React.ReactNode>();

  useEffect(() => {
    if (icon) {
      setComponent(
        <Icon
          onClick={() => dispatch(updateClickMode(mode))}
          name={icon}
          size={'large'}
          bordered={false}
          circular={true}
        />,
      );
    } else {
      setComponent(<p>{mode}</p>);
    }
  }, []);

  return (
    <div
      style={{
        color: color,
        backgroundColor: backgroundColor,
      }}
    >
      {component}
    </div>
  );
};

export default ClickModeMenu;
