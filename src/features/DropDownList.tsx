import React, { useState } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Dropdown, Item } from 'semantic-ui-react';
import { useAppSelector as useSelector } from '../hooks';
import { selectMenuStyle } from '../mapping/mapSlice';

type DropDownListProps = {
  value: string;
  setValue:
    | React.Dispatch<React.SetStateAction<string>>
    | ((arg: string) => void)
    | ActionCreatorWithPayload<string>;
  values: string[];
};

const DropDownList = ({
  value,
  setValue,
  values,
}: DropDownListProps): React.ReactElement => {
  const menuStyle: string = useSelector(selectMenuStyle);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const style = {
    borderRadius: '5px',
    backdropFilter: 'blur(8px) !important',
    backgroundColor: 'rgba(255, 255, 255, 0.027)',
    borderFilter: 'blur(10px)',
    boxShadow: 'inset 0 0 30px 1px rgba(255, 255, 255, 0.1)',
    overflow: 'auto',
    maxHeight: '50%',
  };
  const items = values.map((val) => (
    <div
      key={val}
      style={{
        zIndex: '20',
        width: '100%',
        position: 'relative',
      }}
      className={menuStyle}
      onClick={(e) => {
        setValue(val);
        setIsOpen((val) => !val);
      }}
    >
      {val}
    </div>
  ));
  return (
    <div
      style={{
        borderRadius: '5px',
        overflow: 'hidden',
        borderColor: 'red',
      }}
    >
      <div
        id={value}
        onClick={(e) => setIsOpen((val) => !val)}
        className={menuStyle}
        style={{
          position: 'relative',
        }}
      >
        {value}
      </div>
      {isOpen && (
        <div
          className={menuStyle}
          style={{
            overflow: 'auto',
            width: '100%',
            height: '100%',
            zIndex: '10',
            maxHeight: '18vh',
          }}
        >
          {items}
        </div>
      )}
    </div>
  );
};

export default DropDownList;
