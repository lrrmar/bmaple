import React, { useEffect, useState } from 'react';
import { useAppSelector as useSelector } from '../../hooks';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import getVectorStyle from './Styles';
import { selectCacheEntries, Entry } from '../../mapping/cacheSlice';
import { selectProfileId } from './geojsonFieldSlice';

const Graphics = () => {
  const profileId = useSelector(selectProfileId);
  const cache = useSelector(selectCacheEntries);
  const [currentOlUid, setCurrentOlUid] = useState<string | null>(null);

  useEffect(() => {
    /* get OL vector layers using layer cache and set / remove styling
     * for new and old layers
     */
    const mapUtils: OpenLayersMap = new OpenLayersMap();
    let cacheEntry: Entry | undefined = undefined;
    let newLayer: VectorLayer<Feature> | undefined;
    let currentLayer: VectorLayer<Feature> | undefined;

    // Get layer info from cache
    if (profileId) cacheEntry = cache[profileId];

    // Get new layer from open layers
    if (cacheEntry) newLayer = mapUtils.getLayerByUid(cacheEntry.ol_uid);

    // Get new layer from open layers
    if (cacheEntry && currentOlUid)
      currentLayer = mapUtils.getLayerByUid(currentOlUid);

    // Format current and new layers
    if (currentLayer) currentLayer.setVisible(false);
    if (!cacheEntry) return;
    if (!newLayer) return;
    let hexPalette: { [key: string]: string } | null;
    /*if (cacheEntry.hasOwnProperty('hex_palette')) hexPalette: = cacheEntry.hex_pallette;
    if (cacheEntry.hasOwnProperty('levels')) {
      if (!hexPalette) return;
      const source = newLayer.getSource();
      if (!source) return;
      source.getFeatures().map((feature) => {
        feature.setStyle(
          getVectorStyle(feature.getProperties().level, hexPalette),
        );
      });
    }*/
    newLayer.setVisible(true);
    newLayer.setOpacity(0.8);
    setCurrentOlUid(cacheEntry.ol_uid);
  }, [profileId]);

  return <div className="WrfGraphics"></div>;
};

const WrfGraphic = () => {
  return (
    <div className="WrfGraphic">
      <Graphics />
    </div>
  );
};

export default WrfGraphic;
