import React from 'react';

type Props = {
  children?: React.ReactNode[];
};

const Sources = ({ children }: Props) => {
  return <div className="Sources">{children}</div>;
};

export default Sources;
