import React from 'react';
/*

export type TileConfigurations =
  | 'single'
  | 'duo'
  | 'trio'
  | 'quad'
  | 'bottom bar';

const Single = ({ children }: { children: React.ReactNode[] }) => {
  const parentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    minWidth: '0',
    minHeight: '0',
  };
  const childStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
  };

  return (
    <div style={parentStyle}>
      <div style={childStyle}>{children[0]}</div>
    </div>
  );
};

const Duo = ({ children }: { children: React.ReactNode[] }) => {
  const parentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    minWidth: '0',
    minHeight: '0',
  };
  const childStyle: React.CSSProperties = {
    width: '50%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
  };

  return (
    <div style={parentStyle}>
      <div style={childStyle}>{children[0]}</div>
      <div style={childStyle}>{children[1]}</div>
    </div>
  );
};

const Trio = ({ children }: { children: React.ReactNode[] }) => {
  const parentStyle: React.CSSProperties = {
    width: '100%',
    height: '50%',
    display: 'flex',
    minWidth: '0',
    minHeight: '0',
  };
  const childStyle: React.CSSProperties = {
    width: '33.33%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
  };
  return (
    <div style={parentStyle}>
      <div style={childStyle}>{children[0]}</div>
      <div style={childStyle}>{children[1]}</div>
      <div style={childStyle}>{children[2]}</div>
    </div>
  );
};

const Quad = ({ children }: { children: React.ReactNode[] }) => {
  const parentStyle: React.CSSProperties = {
    width: '100%',
    height: '50%',
    display: 'flex',
    minWidth: '0',
    minHeight: '0',
  };
  const childStyle: React.CSSProperties = {
    width: '50%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
  };
  return (
    <div style={{ ...parentStyle, flexDirection: 'column', height: '100%' }}>
      <div style={parentStyle}>
        <div style={childStyle}>{children[0]}</div>
        <div style={childStyle}>{children[1]}</div>
      </div>
      <div style={parentStyle}>
        <div style={childStyle}>{children[2]}</div>
        <div style={childStyle}>{children[3]}</div>
      </div>
    </div>
  );
};

const getTileConfiguration = ({
  configuration,
  children,
}: {
  configuration: TileConfigurations;
  children: React.ReactNode[];
}) => {
  const lookUp = {
    single: Single({ children: children }),
    duo: Duo({ children: children }),
    trio: Trio({ children: children }),
    quad: Quad({ children: children }),
  };

  return lookUp[configuration];
};

export default getTileConfiguration;*/
