import React from 'react';

type Props = {
  children?: React.ReactNode[];
};

const Profiles = ({ children }: Props) => {
  return <div className="Profiles">{children}</div>;
};

export default Profiles;
