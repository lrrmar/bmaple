import React, { useEffect, useState, useRef } from 'react';

import RegionsFeature, { Regions, isPendingRegions } from './RegionsFeature';
import RegionsLayer from './RegionsLayer';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, request } from '../../mapping/cacheSlice';
import { selectLayerNames } from './regionsSlice';
import { v4 as uuidv4 } from 'uuid';
import KML from 'ol/format/KML';

const parseLimit = (limit: string) => {
  const isSFC = limit.slice(0, 3) === 'SFC';
  if (isSFC) return 0;

  const isUNL = limit.slice(0, 3) === 'UNL';
  if (isUNL) return 100000;

  const isFL = limit.slice(0, 2) === 'FL';
  if (isFL) return parseInt(limit.slice(2, -1)) * 1000;

  const bits = limit.split(' ');
  const feet = parseInt(bits[0]);
  return feet;
};

const RegionsSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const layerNames = useSelector(selectLayerNames);
  const hasFetched = useRef<boolean>(false);
  const layerInitialised = useRef<boolean>(false);
  const featuresInitialised = useRef<boolean>(false);
  const [layerId, setLayerId] = useState<string>('');
  const [layers, setLayers] = useState<React.ReactNode[]>([]);
  const [features, setFeatures] = useState<React.ReactNode[]>([]);
  const [featureIds, setFeatureIds] = useState<string[]>([]);

  useEffect(() => {
    // initialise layer in cache
    if (!layerInitialised.current) {
      const uid = uuidv4();
      const toRequest = {
        id: uid,
        source: sourceIdentifier + '-layer',
      };
      dispatch(request(toRequest));
      setLayerId(uid);
      layerInitialised.current = true;
    }
  }, []);

  /*  useEffect(() => {
    // initialise features in cache
    if (layerId && !featuresInitialised.current) {
      const components: React.ReactNode[] = [];
      featuresInitialised.current = true;
      fetch('./NATS-danger-areas.kml')
        .then((r) => r.text())
        .then((kmlText) => {
          const features = new KML().readFeatures(kmlText, {
            featureProjection: 'EPSG:3857',
          });
          features.forEach((f, i) => {
            components.push(
              <RegionsFeature
                key={`nats-danger-area-${i}`}
                id={`nats-danger-area-${i}`}
                layerId={layerId}
                feature={f}
              />,
            );
          });
          setFeatures(components);
        });
    }
  }, [layerId]);*/

  return (
    <RegionsLayer key={layerId} id={layerId}>
      {features}
    </RegionsLayer>
  );
};
export default RegionsSource;
