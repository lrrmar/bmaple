import React, { useEffect, useState, useRef } from 'react';

import RegionsLayer, { Regions, isPendingRegions } from './RegionsLayer';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, request } from '../../mapping/cacheSlice';
import { selectLayerNames } from './regionsSlice';
import { v4 as uuidv4 } from 'uuid';

const RegionsSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const layerNames = useSelector(selectLayerNames);
  const hasFetched = useRef<boolean>(false);
  const [layers, setLayers] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (layerNames && !hasFetched.current) {
      layerNames.forEach((name) => {
        const uid = uuidv4();
        const toRequest = {
          id: uid, // Essential for type
          source: sourceIdentifier, // Essential for type
          name: name, // Not essential for type
        };
        dispatch(request(toRequest));
      });
      hasFetched.current = true;
    }
  }, []);

  useEffect(() => {
    const filteredIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      const source = element.source;
      return source === sourceIdentifier;
    });
    const components = filteredIds.map((id) => (
      <RegionsLayer key={id} id={id} sourceIdentifier={sourceIdentifier} />
    ));

    // setLayers with these new components
    setLayers(components);
  }, [cache]);

  // render layers
  return <div>{layers}</div>;
};
export default RegionsSource;
