import React from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Dropdown, Item } from 'semantic-ui-react';

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
  const style = {
    borderRadius: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.027)',
    backdropFilter: 'blur(8px)',
    textAlign: 'center',
    borderFilter: 'blur(10px)',
    boxShadow: 'inset 0 0 30px 1px rgba(255, 255, 255, 0.1)',
  };
  const items = values.map((val) => (
    <Dropdown.Item
      key={val}
      text={val}
      value={val}
      style={{
        backgroundColor: 'rgba(125, 125, 125, 0.5)',
        borderFilter: 'blur(10px)',
        zIndex: 20,
      }}
      onClick={(e, d) => {
        if (typeof d.value === 'string') {
          setValue(d.value);
        }
      }}
    >
      {val}
    </Dropdown.Item>
  ));
  return (
    <Dropdown
      id={value.toString()}
      style={{
        ...style,
        border: 'transparent',
      }}
      selection
      fluid
      scrolling
      text={value.toString()}
      onChange={(e, d) => {
        if (typeof d.value === 'string') {
          setValue(d.value);
        }
      }}
    >
      <Dropdown.Menu
        fluid
        inline
        style={{
          backgroundColor: 'rgba(125, 125, 125, 0.5)',
          borderFilter: 'blur(10px)',
        }}
      >
        {items}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropDownList;
