import React, { useState, useEffect } from "react";

export type OptionProp = {
  display: string;
  onClick: () => void;
};

export const Option = ({ display, onClick }: OptionProp) => {
  return <div onClick={onClick}>{display}</div>;
};

export const OptionsMenu = ({ options }: { options: OptionProp[] }) => {
  const [optionComponents, setOptionComponents] = useState<React.ReactNode[]>(
    [],
  );

  useEffect(() => {
    const comps = options.map((option) => {
      const wrappedOnClick = () => {
        option.onClick();
        setOptionComponents([]);
      };
      return Option({ ...option, onClick: wrappedOnClick });
    });
    setOptionComponents(comps);
  }, [options]);

  return (
    <div style={{
      backgroundColor: 'rgba(55,55,55,0.4)',
      position: 'absolute',
      left: '0px',
      right: '0px',
      width: optionComponents.length == 0 ? '0px' : '100vw',
      height: optionComponents.length == 0 ? '0px': '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
          backgroundColor:'white',
          width: 'fit-content',
          height: '20%',
        }}
      >
        <div style={{
          overflow: 'scroll',
          height: '100%'
        }}>
          {optionComponents}
        </div>
        {optionComponents.length > 0 && (
            <div style={{backgroundColor: 'white'}} 
              onClick={() => {
                setOptionComponents([]);
              }}
            >
              Cancel
            </div>
        )}
      </div>
    </div>
  );
};
