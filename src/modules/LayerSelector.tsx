import React, { useState } from 'react';

const LayerSelector = () => {
  const [availableVarnames, setAvailableVarnames] = useState(['1', '2', '3']);
  /*    const [availableDomains, setAvailableDomains] = useState([]);
    const [availableStartTimes , setAvailableStartTimes] = useState([]);
    const [availableValidTimes , setAvailableValidTimes] = useState([]);
    const [availableLevels , setAvailableLevels] = useState([]); */

  return (
    <div>
      <label htmlFor="varname">Variable:</label>
      <select id="varname">
        {[...availableVarnames].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <label htmlFor="varname">Variable:</label>
      <select id="varname">
        {[...availableVarnames].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
      <label htmlFor="varname">Variable:</label>
      <select id="varname">
        {[...availableVarnames].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LayerSelector;
