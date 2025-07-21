import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import Map from 'ol/Map';
import ImageSource from 'ol/source/Image';
import ImageLayer from 'ol/layer/Image';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  selectCacheEntries,
  selectCache,
  Entry,
  isEntry,
} from '../../mapping/cacheSlice';
import {
  selectProfileId,
  selectOpacity,
  selectSetMapExtent,
} from './forceNwrSlice';
import { selectOutlineContours, updateExtent } from '../../mapping/mapSlice';

interface ForceNwrEntry {
  ol_uid: string;
  id: string;
  source: string;
}

const isForceNwrEntry = (a: any): a is ForceNwrEntry => {
  const keys = Object.keys(a);
  return (
    keys.includes('ol_uid') && keys.includes('id') && keys.includes('source')
  );
};

const Graphics = () => {
  const dispatch = useDispatch();
  const profileId = useSelector(selectProfileId);
  const opacity = useSelector(selectOpacity);
  const setMapExtent = useSelector(selectSetMapExtent);
  const cache = useSelector(selectCacheEntries);
  const [currentLayer, setCurrentLayer] =
    useState<ImageLayer<ImageSource> | null>(null);
  const [oldLayer, setOldLayer] = useState<ImageLayer<ImageSource> | null>(
    null,
  );
  const [isStyling, setIsStyling] = useState<boolean>(false);

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */
    const mapUtils: OpenLayersMap = new OpenLayersMap();
    let cacheEntry: Entry | undefined = undefined;
    let forceNwrCacheEntry: ForceNwrEntry | undefined = undefined;
    let newLayer: ImageLayer<ImageSource> | undefined;

    // Get layer info from cache
    if (profileId) cacheEntry = cache[profileId];

    // Verifying type
    if (cacheEntry)
      forceNwrCacheEntry = isForceNwrEntry(cacheEntry) ? cacheEntry : undefined;

    // Get new layer from open layers
    if (forceNwrCacheEntry)
      newLayer = mapUtils.getLayerByUid(forceNwrCacheEntry.ol_uid);

    // current layer ---> old layer
    // new layer ---> current layer
    // extract formatting data from new layer
    if (currentLayer) setOldLayer(currentLayer);
    if (!newLayer) {
      setCurrentLayer(null);
      return;
    }
    if (!forceNwrCacheEntry) return;
    setCurrentLayer(newLayer);
  }, [profileId, cache]);

  // Exchange layer visibility ASAP, dependant on styling bool
  useEffect(() => {
    if (isStyling) return;
    if (oldLayer) {
      oldLayer.setOpacity(0.0);
      setOldLayer(null);
    }
    if (currentLayer) {
      currentLayer.setOpacity(opacity);
      const source = currentLayer.getSource();
      if (source) {
        const extent = source.getImageExtent();
        if (extent && setMapExtent) dispatch(updateExtent(extent));
      }
    }
  }, [currentLayer]);

  // Handle layer colouring change
  useEffect(() => {
    if (!currentLayer) return;
    setIsStyling(true);
    const source: ImageSource | null = currentLayer.getSource();
    if (!source) return;
    setIsStyling(false);
  }, [currentLayer]);

  // Handle opacity
  useEffect(() => {
    if (!currentLayer) return;
    setIsStyling(true);
    currentLayer.setOpacity(opacity);
    setIsStyling(false);
  }, [currentLayer, opacity]);

  return <div className="ForceNwrProfileGraphics"></div>;
};

const ForceNwrProfile = () => {
  return (
    <div className="ForceNwrProfile">
      <Graphics />
    </div>
  );
};

export default ForceNwrProfile;
