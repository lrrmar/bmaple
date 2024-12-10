import React, { useEffect, useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import getVectorStyle from './Styles';
import colourPalettes from './colourPalettes';
import { selectCacheEntries, Entry, isEntry } from '../../mapping/cacheSlice';
import {
  updateColourPaletteId,
  updateColourPalettes,
  updateColourPalette,
  updateContours,
  updateUnits,
  selectProfileId,
  selectColourPaletteId,
  selectUnits,
  selectOpacity,
} from './geojsonFieldSlice';

interface GeojsonFieldEntry extends Entry {
  hex_palette: { [key: string]: string };
  levels: { [key: string]: string };
  units: string;
}

const isGeojsonFieldEntry = (entry: Entry): entry is GeojsonFieldEntry => {
  const keys: string[] = Object.keys(entry);
  return keys.includes('hex_palette') && keys.includes('levels');
};

const Graphics = () => {
  const dispatch = useDispatch();
  const profileId = useSelector(selectProfileId);
  const colourPaletteId = useSelector(selectColourPaletteId);
  const opacity = useSelector(selectOpacity);
  const cache = useSelector(selectCacheEntries);
  const [currentOlUid, setCurrentOlUid] = useState<string | null>(null);
  const [layer, setLayer] = useState<VectorLayer<Feature> | null>(null);
  const [defaultColourPalette, setDefaultColourPalette] = useState<{
    [key: string]: string;
  }>({});

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
    setLayer(newLayer);
    setCurrentOlUid(geojsonFieldCacheEntry.ol_uid);
    dispatch(updateContours(geojsonFieldCacheEntry.levels));
    setDefaultColourPalette(geojsonFieldCacheEntry.hex_palette);
    dispatch(updateUnits(geojsonFieldCacheEntry.units));
  }, [profileId]);

  // Handle colouring
  useEffect(() => {
    if (!layer) return;
    const source: VectorSource<Feature> | null = layer.getSource();
    if (!source) return;
    let hexPalette: { [key: string]: string } = {};
    if (colourPaletteId !== 'default') {
      const numColours = Object.keys(defaultColourPalette).length;
      const paletteColours = colourPalettes[colourPaletteId](numColours);
      console.log(paletteColours);
      for (let i = 0; i < numColours; i++)
        hexPalette[i.toString()] = paletteColours[i];
    } else {
      hexPalette = defaultColourPalette;
    }
    source.getFeatures().map((feature) => {
      feature.setStyle(
        getVectorStyle(feature.getProperties().level, hexPalette),
      );
    });
    layer.setVisible(true);
    dispatch(updateColourPalette(hexPalette));
  }, [layer, colourPaletteId]);

  // Handle opacity
  useEffect(() => {
    if (!layer) return;
    layer.setOpacity(opacity);
  }, [layer, opacity]);

  // Dispatch list of colour palettes
  useEffect(() => {
    dispatch(updateColourPalettes(Object.keys(colourPalettes)));
  }, []);

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
