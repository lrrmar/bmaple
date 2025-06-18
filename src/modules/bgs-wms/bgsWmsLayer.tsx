import React, { useState } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import {
  ingest,
  selectCache,
  Pending,
  isEntry,
  isPending,
} from '../../mapping/cacheSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import Style from 'ol/style/Style';

// import OpenLayers types
import Map from 'ol/Map';
import TileLayer from 'ol/layer/WebGLTile';
import TileWMS from 'ol/source/TileWMS';
import { getUid } from 'ol/util';

export interface BGSWMS extends Pending {
  name: string;
}

export const isBGSWMS = (element: any): element is BGSWMS => {
  const keys: string[] = Object.keys(element);
  return isPending(element) && keys.includes('name');
};

export const isEntryBGSWMS = (element: any): element is BGSWMS => {
  const keys: string[] = Object.keys(element);
  return isEntry(element) && keys.includes('name');
};

const BGSWMSLayer = ({
  id,
  sourceIdentifier,
}: {
  id: string;
  sourceIdentifier: string;
}) => {
  /*
   *  LAYERS
   *
   *  A Layer component is responsible getting the data for a given layer into
   *  the map. Here is how that happens:
   "*
   *  1) Recieves an `id` for a cache element as a prop. (Note: this id points to a cache element that could be an Entry or a Pending)
   *  2) Checks to see if the id does not point to a cache element OR if that element has already been ingested and now has type Entry instead of type Pending OR has the incorrect sourceIdentifier
   3) If any of conditions from (2) are true, we are done and we return an empty <div>
   *  4) All conditions from (2) are false, continue.
   *  5)
   */

  // Access to fundamental data structures
  const dispatch = useDispatch();
  const cache = useSelector(selectCache);
  const [map, setMap] = useState<Map | null>(OpenLayersMap.map);
  const layerData = cache[id];

  if (
    !map ||
    !layerData ||
    isEntry(layerData) ||
    !isBGSWMS(layerData) ||
    layerData['source'] !== sourceIdentifier
  ) {
    // Map n is null || Cache element does not exist || already ingested || isnt a pending BGSWMS || incorrect sourceIdentifier
  } else {
    // Convert layer data from cache into the correct format for an API call, this is a simple one, normally it takes some work!
    const wmsLayerName = layerData.name.replace(' ', '');
    const layer = new TileLayer({
      //extent: [-13884991, 2870341, -7455066, 6338219],
      source: new TileWMS({
        url: 'https://map.bgs.ac.uk/arcgis/services/Offshore/Products_WMS/MapServer/WmsServer',
        params: { LAYERS: `BGS250k.${wmsLayerName}` },
        serverType: 'mapserver',
      }),
      zIndex: 20,
      visible: false,
    });
    if (map) map.addLayer(layer);
    dispatch(ingest({ ...layerData, id: id, ol_uid: getUid(layer) }));
  }

  return <div></div>;
};

export default BGSWMSLayer;
