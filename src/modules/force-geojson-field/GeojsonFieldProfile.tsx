import React, { useEffect, useState } from 'react';
import { useAppSelector as useSelector } from '../../hooks';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import getVectorStyle from './Styles';
import { selectCacheEntries, Entry, isEntry } from '../../mapping/cacheSlice';
import { selectProfileId } from './geojsonFieldSlice';

interface GeojsonFieldEntry extends Entry {
  hex_palette: { [key: string]: string };
  levels: { [key: string]: string };
}

const isGeojsonFieldEntry = (entry: Entry): entry is GeojsonFieldEntry => {
  const keys: string[] = Object.keys(entry);
  return keys.includes('hex_palette') && keys.includes('levels');
};

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
    let geojsonFieldCacheEntry: GeojsonFieldEntry | undefined = undefined;
    let newLayer: VectorLayer<Feature> | undefined;
    let currentLayer: VectorLayer<Feature> | undefined;

    // Get layer info from cache
    if (profileId) cacheEntry = cache[profileId];

    // Verifying type
    if (cacheEntry)
      geojsonFieldCacheEntry = isGeojsonFieldEntry(cacheEntry)
        ? cacheEntry
        : undefined;

    // Get new layer from open layers
    if (geojsonFieldCacheEntry)
      newLayer = mapUtils.getLayerByUid(geojsonFieldCacheEntry.ol_uid);
    if (geojsonFieldCacheEntry)
      if (geojsonFieldCacheEntry && currentOlUid)
        // Get new layer from open layers
        currentLayer = mapUtils.getLayerByUid(currentOlUid);

    // Format current and new layers
    if (currentLayer) currentLayer.setVisible(false);
    if (!geojsonFieldCacheEntry) return;
    if (!newLayer) return;
    const hexPalette = geojsonFieldCacheEntry.hex_palette;
    const source = newLayer.getSource();
    if (!source) return;
    source.getFeatures().map((feature) => {
      feature.setStyle(
        getVectorStyle(feature.getProperties().level, hexPalette),
      );
    });
    newLayer.setVisible(true);
    newLayer.setOpacity(0.8);
    setCurrentOlUid(geojsonFieldCacheEntry.ol_uid);
  }, [profileId]);

  return <div className="GeoJsonFieldProfileGraphics"></div>;
};

const GeoJsonFieldProfile = () => {
  return (
    <div className="GeoJsonFieldProfile">
      <Graphics />
    </div>
  );
};

export default GeoJsonFieldProfile;
