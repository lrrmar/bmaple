import { useEffect } from 'react';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
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
import { loadRainfallCanvas } from './rainfallPng';

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
    const controller = new AbortController();
    const imageExtent = transformExtent(
      [lonMin, latMin, lonMax, latMax],
      dataCrs,
      'EPSG:3857',
    );
    const source = new ImageSource({
      projection: 'EPSG:3857',
      loader: async () => {
        const image = await loadRainfallCanvas(id, controller.signal);
        return {
          image,
          extent: imageExtent,
          resolution: [
            (imageExtent[2] - imageExtent[0]) / image.width,
            (imageExtent[3] - imageExtent[1]) / image.height,
          ],
          pixelRatio: 1,
        };
      },
      interpolate: interpolationEnabled,
    });
    source.on('imageloaderror', () => {
      console.error(`Failed to load forecast overlay: ${id}`);
    });
    const layer = new ImageLayer({
      source,
      extent: imageExtent,
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
      controller.abort();
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
