import React, { useState, useEffect } from 'react';

export type OptionProp = {
  display: string;
  onClick: () => void;
};

export const Option = ({ display, onClick }: OptionProp) => {
  return <div onClick={onClick}>{display}</div>;
};

export const OptionsMenu = ({
  options,
  message,
  height,
  width,
}: {
  options: OptionProp[];
  message?: string;
  width?: string;
  height?: string;
}) => {
  const [optionComponents, setOptionComponents] = useState<React.ReactNode[]>(
    [],
  );
  const [optionMessage, setOptionMessage] = useState<string | undefined>();

  useEffect(() => {
    const comps = options.map((option) => {
      const wrappedOnClick = () => {
        option.onClick();
        setOptionComponents([]);
      };
      return Option({ ...option, onClick: wrappedOnClick });
    });
    setOptionComponents(comps);
    setOptionMessage(message);
  }, [options, message]);

  const displayWidth = width ? width : '100vw';
  const displayHeight = height ? height : '100vh';

  return (
    <div
      style={{
        backgroundColor: 'rgba(55,55,55,0.4)',
        position: 'absolute',
        left: '0px',
        width: optionComponents.length == 0 ? '0px' : displayWidth,
        height: optionComponents.length == 0 ? '0px' : displayHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          width: 'fit-content',
          height: '20%',
        }}
      >
        {message && optionComponents.length > 0 && (
          <div>
            <h4>{message}</h4>
          </div>
        )}
        <div
          style={{
            overflow: 'scroll',
            height: '100%',
          }}
        >
          {optionComponents}
        </div>
        {optionComponents.length > 0 && (
          <div
            style={{ backgroundColor: 'white' }}
            onClick={() => {
              setOptionComponents([]);
              setOptionMessage(undefined);
            }}
          >
            Cancel
          </div>
        )}
      </div>
    </div>
  );
};
