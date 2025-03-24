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
import { selectOutlineContours } from '../../mapping/mapSlice';

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
  const outlineContours = useSelector(selectOutlineContours);
  const [currentLayer, setCurrentLayer] = useState<VectorLayer<Feature> | null>(
    null,
  );
  const [oldLayer, setOldLayer] = useState<VectorLayer<Feature> | null>(null);
  const [isStyling, setIsStyling] = useState<boolean>(false);
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

    // current layer ---> old layer
    // new layer ---> current layer
    // extract formatting data from new layer
    if (currentLayer) setOldLayer(currentLayer);
    if (!newLayer) {
      setCurrentLayer(null);
      return;
    }
    if (!geojsonFieldCacheEntry) return;
    setCurrentLayer(newLayer);
    dispatch(updateContours(geojsonFieldCacheEntry.levels));
    setDefaultColourPalette(geojsonFieldCacheEntry.hex_palette);
    dispatch(updateUnits(geojsonFieldCacheEntry.units));
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
    const source: VectorSource<Feature> | null = currentLayer.getSource();
    if (!source) return;
    let hexPalette: { [key: string]: string } = {};
    if (colourPaletteId !== 'default') {
      const numColours = Object.keys(defaultColourPalette).length;
      const paletteColours = colourPalettes[colourPaletteId](numColours);
      for (let i = 0; i < numColours; i++)
        hexPalette[i.toString()] = paletteColours[i];
    } else {
      hexPalette = defaultColourPalette;
    }
    source.getFeatures().map((feature) => {
      feature.setStyle(
        getVectorStyle(
          feature.getProperties().level,
          hexPalette,
          outlineContours,
        ),
      );
    });
    setIsStyling(false);
    dispatch(updateColourPalette(hexPalette));
  }, [currentLayer, colourPaletteId, outlineContours]);

  // Handle opacity
  useEffect(() => {
    if (!currentLayer) return;
    setIsStyling(true);
    currentLayer.setOpacity(opacity);
    setIsStyling(false);
  }, [currentLayer, opacity]);

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
