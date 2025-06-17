import React, { useEffect, useState } from 'react';

import BGSWMSLayer, { BGSWMS, isBGSWMS } from './bgsWmsLayer';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, request } from '../../mapping/cacheSlice';
import { selectLayerNames } from './bgsWmsSlice';

const BGSWMSSource = ({ sourceIdentifier }: { sourceIdentifier: string }) => {
  /*
   *  SOURCE
   *
   *  This source has two reponsibilities:
   *    A) On inital render, put in a Request to the cache for each layer we want from the BGS WMS
   *    B) Generate the Layer components needed to get data onto the map
   */
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const layerNames = useSelector(selectLayerNames);
  const [layers, setLayers] = useState<React.ReactNode[]>([]);

  //A) On inital render, put in a Request to the cache for each layer we want from the BGS WMS
  useEffect(() => {
    if (layerNames) {
      layerNames.forEach((name) => {
        const uid = 'id' + new Date().getTime();
        const toRequest = {
          id: uid, // Essential for type
          source: sourceIdentifier, // Essential for type
          name: name, // Not essential for type
        };
        dispatch(request(toRequest));
      });
    }
  }, []);

  // B) Generate the Layer components needed to get data onto the map
  useEffect(() => {
    // Get the IDs of all cache elements that have come from this source
    const filteredIds = Object.keys(cache).filter((id) => {
      const element = cache[id];
      const source = element.source;
      return source === sourceIdentifier;
    });
    // Create a BGSWMSLayer for each id
    const components = filteredIds.map((id) => (
      <BGSWMSLayer key={id} id={id} sourceIdentifier={sourceIdentifier} />
    ));

    // setLayers with these new components
    setLayers(components);
  }, [cache]);

  // render layers
  return <div>{layers}</div>;
};
export default BGSWMSSource;
