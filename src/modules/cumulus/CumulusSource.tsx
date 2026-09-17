import React, { useEffect, useState } from 'react';
import mapReducer, { mapSlice } from '../../mapping/mapSlice';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';
import { request, Request, selectCache, Cache } from '../../mapping/cacheSlice';
import {
  selectSelectedOnsetVariable,
  selectSelectedDayOfYear,
  selectSelectedEntry,
  updateSelectedDayOfYear,
  updateSelectedEntry,
  updateProfileLayerId,
  selectBaseUrl,
} from './cumulusSlice';
import CumulusSourceLayer from './CumulusSourceLayer';
import { transformExtent } from 'ol/proj';
import type { Extent } from 'ol/extent';

type RunFileEntry = {
  input_nc: string;
  output_png: string;
  init_time: string | null;
  valid_time: string | null;
  lead_time_hours: number | null;
};

type SpatialBounds = {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
};

type RunMetadata = {
  input_model_root: string;
  output_model_root: string;
  data_crs: 'EPSG:4326';
  display_crs: 'EPSG:3857';
  spatial_bounds: SpatialBounds;
  rendering: {
    variable: string;
    bins_mm: string[];
    colors: string[];
  };
  files: RunFileEntry[];
};

const exampleBounds: SpatialBounds = {
  lat_max: 26,
  lat_min: -11,
  lon_max: 57,
  lon_min: -20,
};

function buildExtent(
  bounds: SpatialBounds,
  data_crs: string,
  display_crs: string,
) {
  const extent4326: [number, number, number, number] = [
    bounds.lon_min,
    bounds.lat_min,
    bounds.lon_max,
    bounds.lat_max,
  ];

  return transformExtent(extent4326, data_crs, display_crs);
}

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const CumulusSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const onsetVariable = useSelector(selectSelectedOnsetVariable);
  const dayOfYear: string | null = useSelector(selectSelectedDayOfYear);
  const entry: string | null = useSelector(selectSelectedEntry);
  //const liRequestId: string | null = useSelector(selectSelectedLightningId);
  //const hashTables: HashTable[] = useSelector(selectHashTables);
  const cumulusBaseUrl = useSelector(selectBaseUrl);
  const [runMeta, setRunMeta] = useState<RunMetadata | null>(null);
  const [extent, setExtent] = useState<Extent | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Put initial entry into cache
  useEffect(() => {
    const requestId = dayOfYear + '?' + entry;
    const newRequest = {
      id: requestId,
      source: 'cumulus',
    };

    dispatch(request(newRequest));

    const extent = buildExtent(exampleBounds, 'EPSG:4326', 'EPSG:3857');
    setExtent(extent);
  }, []);

  useEffect(() => {
    const requestId = dayOfYear + '?' + entry;
    if (requestId && !cache[requestId]) {
      console.log('CACHE MISS');
      dispatch(request({ id: requestId, source: 'cumulus' }));
    } else {
      console.log('CACHE HIT');
      dispatch(updateProfileLayerId(requestId));
    }
  }, [onsetVariable, dayOfYear, entry]);

  useEffect(() => {
    if (!runMeta) return;
    const extent = buildExtent(
      runMeta.spatial_bounds,
      runMeta.data_crs,
      runMeta.display_crs,
    );
    console.log('Built extent from run metadata: ', extent);
    setExtent(extent);
  }, [runMeta]);

  const getMetadataUrl = (storageHost: string, runDate: string | null) => {
    if (!runDate) {
      return '';
    }
    const host = storageHost.replace(/\/+$/g, '');
    const path = `${runDate}/model_unet_precip/run_metadata.json`;
    return `https://${host}/${path}`;
  };

  useEffect(() => {
    async function loadRunMetadata(url: string) {
      console.log('Fetching metadata from URL: ' + url);
      try {
        const meta = (await fetch(url).then((r) => r.json())) as RunMetadata;
        setRunMeta(meta);
        console.log('Loaded run metadata: ', meta);
      } catch (error) {
        console.error('Failed to fetch run metadata:', error);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    // Load metadata when the dayOfYear changes
    console.log('Changed dayOfYear: ' + dayOfYear);
    const metadataUrl = getMetadataUrl(cumulusBaseUrl, dayOfYear);
    //void loadRunMetadata(metadataUrl);
  }, [dayOfYear]);

  /*
  useEffect(() => {
    if (rdtRequestId && !cache[rdtRequestId]) {
      dispatch(request({ id: rdtRequestId, source: 'fasta' }));
    } else {
      dispatch(updateProfileRdtId(rdtRequestId));
    }
  }, [rdtRequestId]);

  useEffect(() => {
    if (liRequestId && !cache[liRequestId]) {
      dispatch(request({ id: liRequestId, source: 'fasta' }));
    } else {
      dispatch(updateProfileLightningId(liRequestId));
    }
  }, [liRequestId]);
  */

  const sourcesToLoad = Object.keys(cache).map((id) => {
    console.log(
      'Loading source with id: ' +
        id +
        ' and extent: ' +
        JSON.stringify(extent),
    );
    return (
      <CumulusSourceLayer
        sourceIdentifier={sourceIdentifier}
        key={id}
        id={id}
        extent={extent}
      />
    );
  });

  //const fastaHashTable = FastaHashTablesServer();

  return <div className="CumulusSource">{sourcesToLoad}</div>;
};

export default CumulusSource;
