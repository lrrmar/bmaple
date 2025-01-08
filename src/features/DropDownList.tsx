import React from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Dropdown } from 'semantic-ui-react';

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
}: DropDownListProps): React.ReactElement => (
  <Dropdown
    id={value.toString()}
    placeholder={value.toString()}
    search
    onChange={(e, d) => {
      if (typeof d.value === 'string') {
        setValue(d.value);
      }
    }}
    options={[...values].map((val) => ({
      key: val,
      text: val,
      value: val,
    }))}
  />
);

export default DropDownList;
