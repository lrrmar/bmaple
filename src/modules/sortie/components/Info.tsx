import React, {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { type SortieInfo, EditSortieFormKeys } from '../types';

import './page.css';
import { OptionProp } from './OptionsMenu';
import TextInputSubmit from './TextInputSubmit';

const Info = ({
  sortieInfo,
  setSortieInfo,
}: {
  sortieInfo: SortieInfo;
  setSortieInfo: Dispatch<SetStateAction<SortieInfo>>;
}) => {
  const [formComponents, setFormComponents] = useState<React.ReactNode[]>([]);
  useEffect(() => {
    const formLines = EditSortieFormKeys.map((key) => {
      return (
        <div key={key}>
          {key}
          <TextInputSubmit
            defaultValue={sortieInfo[key]}
            onSubmit={(value: string) => {
              const newSortieInfo = { ...sortieInfo };
              newSortieInfo[key] = value;
              setSortieInfo(newSortieInfo);
            }}
          />
        </div>
      );
    });
    setFormComponents(formLines);
  }, [sortieInfo]);

  return (
    <div className={'Page'}>
      <h1 style={{ alignSelf: 'center', margin: '1em' }}>Sortie Info</h1>
      <div>{formComponents}</div>
    </div>
  );
};

export default Info;
