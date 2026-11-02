import React, { useEffect, useRef } from 'react';
import Zoom from 'ol/control/Zoom';

import OpenLayersMap from './OpenLayersMap';
import './ZoomControls.css';

const ZoomControls = () => {
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target.current) return;
    const map = OpenLayersMap.map;
    const control = new Zoom({
      target: target.current,
      zoomInTipLabel: 'Zoom in',
      zoomOutTipLabel: 'Zoom out',
    });
    map.addControl(control);
    return () => {
      map.removeControl(control);
      control.dispose();
    };
  }, []);

  return <div ref={target} className="map-zoom-controls" />;
};

export default ZoomControls;
