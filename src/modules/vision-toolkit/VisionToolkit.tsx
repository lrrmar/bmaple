import React, { useEffect, useState } from 'react';

import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectTimes } from '../flight-paths/flightPathSlice';
import { updateTimeseries } from '../timeseries/timeseriesSlice';

const VisionToolkit = () => {
  const dispatch = useDispatch();
  const times = useSelector(selectTimes);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    // When coords pairs change, call VTK for new segments

    // FOR NOW just get times and generate random numbers
    //
    const values: number[] = [];
    for (let i = 0; i < times.length; i++) {
      values.push(((-1) ** i * i) % 5);
    }
    setValues(values);
  }, [times]);

  useEffect(() => {
    // whenever values change, dispatch new 'flight' timeseries
    // to timeseriesSlice

    // NEED TO NAIL DOWN TYPING...
    const stringTimes = times.map((str) => String(str));
    dispatch(
      updateTimeseries({
        id: 'flight',
        timeseries: {
          times: stringTimes,
          values: values,
          units: 'none',
        },
      }),
    );
  }, [values]);

  return <div></div>;
};

export default VisionToolkit;
