import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import Map from 'ol/Map';
import ImageSource from 'ol/source/Image';
import ImageLayer from 'ol/layer/Image';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import { selectCacheEntries, Entry, isEntry } from '../../mapping/cacheSlice';
import { selectProfileId, selectOpacity } from './teamxSlice';
import { selectOutlineContours } from '../../mapping/mapSlice';

interface TeamxEntry {
  ol_uid: string;
  id: string;
  sourceIdentifier: string;
}

const isTeamxEntry = (a: any): a is TeamxEntry => {
  return true;
};

const Graphics = () => {
  const dispatch = useDispatch();
  const profileId = useSelector(selectProfileId);
  const opacity = useSelector(selectOpacity);
  const cache = useSelector(selectCacheEntries);
  const outlineContours = useSelector(selectOutlineContours);
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
    let teamxCacheEntry: TeamxEntry | undefined = undefined;
    let newLayer: ImageLayer<ImageSource> | undefined;

    // Get layer info from cache
    if (profileId) cacheEntry = cache[profileId];

    // Verifying type
    if (cacheEntry)
      teamxCacheEntry = isTeamxEntry(cacheEntry) ? cacheEntry : undefined;

    // Get new layer from open layers
    if (teamxCacheEntry)
      newLayer = mapUtils.getLayerByUid(teamxCacheEntry.ol_uid);

    // current layer ---> old layer
    // new layer ---> current layer
    // extract formatting data from new layer
    if (currentLayer) setOldLayer(currentLayer);
    if (!newLayer) {
      setCurrentLayer(null);
      return;
    }
    if (!teamxCacheEntry) return;
    setCurrentLayer(newLayer);
  }, [profileId]);

  // Exchange layer visibility ASAP, dependant on styling bool
  useEffect(() => {
    if (isStyling) return;
    if (oldLayer) {
      oldLayer.setVisible(false);
      setOldLayer(null);
    }
    if (currentLayer) currentLayer.setVisible(true);
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

  return <div className="TeamxProfileGraphics"></div>;
};

const TeamxProfile = () => {
  return (
    <div className="TeamxProfile">
      <Graphics />
    </div>
  );
};

export default TeamxProfile;
