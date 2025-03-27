import * as Bokeh from '@bokeh/bokehjs';
import React, { useState, useEffect } from 'react';
import { selectTimes } from '../flight-paths/flightPathSlice';
import { useAppSelector as useSelector } from '../../hooks';

const BokehPlot = () => {
  const [data, setData] = useState<Bokeh.embed.JsonItem | null>(null);
  const times = useSelector(selectTimes);

  useEffect(() => {
    if (times.length < 2) return;
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
        body: JSON.stringify({ times: times }),
      });
      const data = await response.json();
      setData(data);
    };
    fetchPlot();
  }, [times]);

  useEffect(() => {
    console.log(data);
    const target = document.getElementById('bk-plot');
    if (target) {
      while (target.firstChild) {
        target.removeChild(target.firstChild);
      }
    }
    if (
      data &&
      data.target_id &&
      data.doc &&
      target &&
      target.children.length < 1
    ) {
      console.log('rend');
      Bokeh.embed.embed_item(data, 'bk-plot');
    }
  }, [data]);

  return <div id="bk-plot"></div>;
};

export default BokehPlot;
