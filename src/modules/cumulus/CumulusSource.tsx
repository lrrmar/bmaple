import React, { useEffect } from 'react';

import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { request, Cache } from '../../mapping/cacheSlice';

import {
  selectSelectedAccumDays,
  selectSelectedLeadTime,
  updateProfileLayerId,
  selectBaseUrl,
  selectCatalogueStatus,
  selectDatasetMatch,
  selectProfileLayerId,
} from './cumulusSlice';
import { buildPngUrl } from './catalogue';
import CumulusSourceLayer from './CumulusSourceLayer';

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const CumulusSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const accumDays = useSelector(selectSelectedAccumDays);
  const entry = useSelector(selectSelectedLeadTime);
  const baseUrl = useSelector(selectBaseUrl);
  const status = useSelector(selectCatalogueStatus);
  const { product } = useSelector(selectDatasetMatch);
  const profileLayerId = useSelector(selectProfileLayerId);
  // The full URL identifies a layer, including its variant and checkpoint.
  const url =
    status === 'ready' && product && accumDays && entry
      ? buildPngUrl(baseUrl, product, accumDays, entry)
      : null;

  useEffect(() => {
    if (profileLayerId !== url) dispatch(updateProfileLayerId(url));
  }, [dispatch, url, profileLayerId]);

  useEffect(() => {
    if (!url || !product || cache[url]) return;
    const extent = product.image_extent;
    dispatch(
      request({
        id: url,
        source: sourceIdentifier,
        imageExtent: [
          extent.longitude_min,
          extent.latitude_min,
          extent.longitude_max,
          extent.latitude_max,
        ],
        dataCrs: product.data_crs,
      }),
    );
  }, [dispatch, url, product, cache, sourceIdentifier]);

  return (
    <div className="CumulusSource">
      {Object.entries(cache).map(([id, cached]) => {
        const extent: unknown = cached.imageExtent;
        if (
          cached.source !== sourceIdentifier ||
          !Array.isArray(extent) ||
          extent.length !== 4 ||
          !extent.every((value) => typeof value === 'number') ||
          typeof cached.dataCrs !== 'string'
        )
          return null;
        return (
          <CumulusSourceLayer
            key={id}
            id={id}
            sourceIdentifier={sourceIdentifier}
            extent={extent.map(Number)}
            dataCrs={cached.dataCrs}
          />
        );
      })}
    </div>
  );
};

export default CumulusSource;
