import * as Bokeh from '@bokeh/bokehjs';
import React, { useState, useEffect } from 'react';
import {
  selectTimeseries,
  selectDisplayed,
  Timeseries,
} from '../timeseries/timeseriesSlice';
import { useAppSelector as useSelector } from '../../hooks';

const areArraysEqual = <T,>(arr1: T[], arr2: T[]): boolean =>
  arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);

const BokehPlot = () => {
  const updatedTimeseries = useSelector(selectTimeseries);
  const displayed = useSelector(selectDisplayed);
  const [timeseries, setTimeseries] = useState<{ [key: string]: Timeseries }>(
    {},
  );
  const [bokehItem, setBokehItem] = useState<Bokeh.embed.JsonItem | null>(null);

  useEffect(() => {
    // Check for changes in timeseries data or TODO which
    // time series are currently displayed

    // Check displayed
    if (!areArraysEqual(Object.keys(timeseries), displayed)) {
      setTimeseries(updatedTimeseries);
      return;
    }

    // For each displayed timeseries id, see if times or values
    // has changed
    displayed.forEach((id) => {
      const current = timeseries[id];
      const updated = updatedTimeseries[id];
      if (!areArraysEqual(current.times, updated.times)) {
        setTimeseries(updatedTimeseries);
        return;
      }
      if (!areArraysEqual(current.data, updated.data)) {
        setTimeseries(updatedTimeseries);
        return;
      }
    });
  }, [updatedTimeseries, displayed]);

  useEffect(() => {
    // Fetch new bokeh item if there is a change to
    // time series
    if (!timeseries['flight']) {
      return;
    } else if (timeseries['flight'].times.length < 1) {
      return;
    }

    const fetchPlot = async () => {
      const response = await fetch('http://localhost:8282/plot', {
        method: 'post',
        mode: 'cors',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Origin: window.location.origin,
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(timeseries['flight']),
      });
      const bokehItem = await response.json();
      setBokehItem(bokehItem);
    };
    fetchPlot();
  }, [timeseries]);

  useEffect(() => {
    const target = document.getElementById('bk-plot');
    if (target) {
      while (target.firstChild) {
        target.removeChild(target.firstChild);
      }
    }
    if (
      bokehItem &&
      bokehItem.target_id &&
      bokehItem.doc &&
      target &&
      target.children.length < 1
    ) {
      Bokeh.embed.embed_item(bokehItem, 'bk-plot');
    }
  }, [bokehItem]);

  const style = {
    width: '40vw',
    height: '0.4vh',
  };
  return <div style={style} id="bk-plot"></div>;
};

export default BokehPlot;
