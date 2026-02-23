import React, { useState, useEffect } from 'react';
import type { TextInputSubmitProps } from '../types';
export const TextInputSubmit = ({
  onSubmit,
  defaultValue = '',
}: TextInputSubmitProps) => {
  const [value, setValue] = useState<string>(defaultValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value);
      setValue(value);
    }
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  return (
    <input
      style={{
        width: '100%',
        borderStyle: 'dotted',
        backgroundColor: 'rgba(0,0,0,0)',
      }}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TextInputSubmit;
