import React from 'react';
import './SegmentedControl.css';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange?: (index: number) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
}) => {
  return (
    <div className="segmented-control">
      {options.map((option, index) => (
        <button
          key={index}
          className={`segmented-control-button ${
            index === selectedIndex ? 'active' : ''
          }`}
          onClick={() => onChange?.(index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
