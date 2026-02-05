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

const ClickModeMenu = ({
  modes,
}: {
  modes: { name: string; icon?: SemanticICONS }[];
}) => {
  const clickMode = useSelector(selectClickMode);
  const clickEvent = useSelector(selectClickEvent);

  useEffect(() => {
    console.log(clickEvent);
    console.log(clickMode);
  }, [clickEvent]);
  return (
    <div>
      {modes.map((mode) => (
        <ClickMode mode={mode.name} icon={mode.icon} />
      ))}
    </div>
  );
};

const ClickMode = ({ mode, icon }: { mode: string; icon?: SemanticICONS }) => {
  const dispatch = useDispatch();
  const [component, setComponent] = useState<React.ReactNode>();

  useEffect(() => {
    if (icon) {
      setComponent(
        <Icon onClick={() => dispatch(updateClickMode(mode))} name={icon} />,
      );
    } else {
      setComponent(<p>{mode}</p>);
    }
  }, []);

  return component;
};

export default ClickModeMenu;
