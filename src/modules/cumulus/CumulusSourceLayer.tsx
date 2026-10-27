import { useEffect } from 'react';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import { getUid } from 'ol/util';
import { transformExtent } from 'ol/proj';
import type { Extent } from 'ol/extent';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { ingest } from '../../mapping/cacheSlice';
import openLayersMap from '../../mapping/OpenLayersMap';

import { selectInterpolationEnabled } from './cumulusSlice';

interface Props {
  id: string;
  sourceIdentifier: string;
  extent: Extent;
  dataCrs: string;
}

const CumulusSourceLayer = ({
  id,
  sourceIdentifier,
  extent,
  dataCrs,
}: Props) => {
  const dispatch = useDispatch();
  const interpolationEnabled = useSelector(selectInterpolationEnabled);
  const [lonMin, latMin, lonMax, latMax] = extent;

  useEffect(() => {
    const source = new ImageStatic({
      url: id,
      imageExtent: transformExtent(
        [lonMin, latMin, lonMax, latMax],
        dataCrs,
        'EPSG:3857',
      ),
      interpolate: interpolationEnabled,
    });
    source.on('imageloaderror', () => {
      console.error(`Failed to load forecast overlay: ${id}`);
    });
    const layer = new ImageLayer({
      source,
      opacity: 0.75,
      // Only CumulusGraphic decides which cached layer is visible.
      visible: false,
    });
    const map = openLayersMap.map;
    map.addLayer(layer);
    dispatch(
      ingest({
        id,
        source: sourceIdentifier,
        ol_uid: getUid(layer),
        imageExtent: [lonMin, latMin, lonMax, latMax],
        dataCrs,
      }),
    );

    return () => {
      map.removeLayer(layer);
      layer.dispose();
      source.dispose();
    };
  }, [
    dispatch,
    id,
    sourceIdentifier,
    lonMin,
    latMin,
    lonMax,
    latMax,
    dataCrs,
    interpolationEnabled,
  ]);

  return null;
};

export default CumulusSourceLayer;
