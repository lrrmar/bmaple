import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, isEntry } from '../../mapping/cacheSlice';
import { selectCurrentLayerName, selectOpacity } from './faamPhysicsSlice';
import { isEntryFaamPhysics } from './FaamPhysicsLayer';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { Circle } from 'ol/geom';
import {Style, Stroke, Fill} from 'ol/style';

import { selectVerticalLevel, selectDisplayTime } from '../../mapping/mapSlice';

// Breakpoints (x values)
const breaks = [500, 10000, 20000, 30000, 35000];

// Cubic coefficients per interval: [a, b, c, d]
// For f(x) = a*dx^3 + b*dx^2 + c*dx + d   with dx = x - breaks[i]
const coeffs = [
  [
    -2.8325661799928977e-10, -2.321333914563701e-20, 0.3285714285714287,
    21000.0,
  ],
  [1.1606648199445977e-9, -4.036406806489902e-6, 0.2823308270676691, 24000.0],
  [-1.1887613771270277e-9, 1.3373565492679063e-5, 0.5257024139295607, 27000.0],
  [5.943806885635138e-10, -4.457855164226354e-6, 0.6148595172140878, 33000.0],
];

function speed(x: number) {
  // Find interval
  let i = breaks.length - 2;
  for (let j = 0; j < breaks.length - 1; j++) {
    if (x >= breaks[j] && x <= breaks[j + 1]) {
      i = j;
      break;
    }
  }

  const [a, b, c, d] = coeffs[i];
  const dx = x - breaks[i];

  // Horner's method
  return ((a * dx + b) * dx + c) * dx + d;
}

const dist = (z: number, t: number, z0: number, t0: number): number => {
  if (t == t0 ) return 0;
  const s = (speed(z) + speed(z0)) / 2;
  return s * Math.abs(t - t0 - Math.abs(z - z0) / 1000);
};

const FaamPhysicsProfile = () => {
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);

  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [displayedIds, setDisplayedIds] = useState<string[]>([]);
  
  const loaded = useRef<boolean>(false);
  useEffect(() => {
    console.log('use effect');
    const element = cache['faam-ring'];
    if (element && isEntry(element)) {
      const mapUtils = new OpenLayersMap();
      let olLayer: VectorLayer<Feature> | undefined;
      const ol_uid = element.ol_uid;
      if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
      if (olLayer) {
        console.log(olLayer);
      }
    }
  }, [])

  useEffect(() => {
    const base = 10000;
    const time = 1764320400000;
    const element = cache['faam-ring'];
    if (element && isEntry(element)) {
      const mapUtils = new OpenLayersMap();
      let olLayer: VectorLayer<Feature> | undefined;
      const ol_uid = element.ol_uid;
      if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
      if (olLayer) {
        if (!loaded.current) {
          // Initial render, set style
          console.log('load')
          loaded.current = true;
          olLayer.setStyle(new Style({
            stroke: new Stroke({
              color: 'rgba(5,22,255,1)',
              width: 0.7,
            }),
            fill: new Fill({
              color: 'rgba(255,255,255,0.01)',
            }),
          }));
        }

        if (verticalLevel && displayTime) {
          olLayer.setVisible(true);
          const dt = displayTime/ (60 * 1000) // ms to mins
          const t = time/ (60 * 1000) // ms to mins
          const radius_metres = dist(parseInt(verticalLevel), dt, base, t) / 3.3;
          const source = olLayer.getSource();
          if (source) {
            const feature = source.getFeatures()[0];
            if (feature) {
              const circle = feature.getGeometry();
              if (circle && circle instanceof Circle)
                circle.setRadius(radius_metres);
            }
          }
        } else {
          olLayer.setVisible(false);
        }
      }
    }
  }, [verticalLevel, displayTime]);

  useEffect(() => {
    // When opacity changes, change corresponding layers

    displayedIds.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setOpacity(opacity);
      }
    });
  }, [opacity, displayedIds]);

  return <div></div>;
};

export default FaamPhysicsProfile;
