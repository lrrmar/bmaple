import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './LocationsList.css';
import {
  selectCache,
  Cache,
  ingest,
  Ingest,
  remove,
  Remove,
  update,
  Update,
  Pending,
  isPending,
  Entry,
  isEntry,
  CacheElement,
  selectCacheEntries,
} from '../../mapping/cacheSlice';
import {
  selectClickEvent,
  selectFeaturesAtClick,
  selectDisplayTime,
  selectVerticalLevel,
  FeatureAtClick,
} from '../../mapping/mapSlice';
import type { Waypoint } from '../waypoints/WaypointProfile';
import { isWaypoint } from '../waypoints/WaypointProfile';

import { updateMode, selectMode } from '../waypoints/waypointSlice';
import openLayersMap from '../../mapping/OpenLayersMap';
import BaseLayer from 'ol/layer/Base.js';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature } from 'ol';
import { getUid } from 'ol/util';

export interface Location {
  [key: string]: string | boolean | undefined;
  lon: string;
  lat: string;
  description: string | undefined;
  waypointId: string;
  layerUid: string | undefined;
  featureUid: string | undefined;
  isSelected: boolean;
}

interface Props {
  sourceIdentifier: string;
  domain: string;
  locations: Location[];
  setLocations: Dispatch<SetStateAction<Location[]>>;
  setReportMode: Dispatch<SetStateAction<boolean>>;
}

export const LocationsList = ({
  sourceIdentifier,
  domain,
  locations,
  setLocations,
  setReportMode,
}: Props) => {
  const map = openLayersMap.map;

  const nLocations = 10;
  const mode = useSelector(selectMode);

  // It's a hash table stupid
  const cacheEntries: { [key: string]: Entry } =
    useSelector(selectCacheEntries);

  const dispatch = useDispatch();

  // listen out for clicks on existing locations
  const clickEvent = useSelector(selectClickEvent);
  const featuresAtClick = useSelector(selectFeaturesAtClick);
  const [selectedFeatureUid, setSelectedFeatureUid] = useState<
    string | undefined
  >();

  // Intercept a map click on existing feature
  useEffect(() => {
    if (!clickEvent) {
      return;
    }

    console.log('**** clickEvent ******');
    console.log('LocationsList: featuresAtClick:' + featuresAtClick.length);

    featuresAtClick.map((feature) =>
      console.log('feature: ' + feature.ol_uid + ' ' + feature.source),
    );

    const geojsonFeature = featuresAtClick[0];
    let selectedOlUid;
    if (geojsonFeature) {
      selectedOlUid = geojsonFeature.ol_uid;
    }

    setSelectedFeatureUid(selectedOlUid);
  }, [clickEvent]);

  const getBaseLayer = (uid: string | null): BaseLayer | undefined => {
    let baseLayer: BaseLayer | undefined = undefined;
    map
      .getLayers()
      .getArray()
      .forEach((l) => {
        if (getUid(l) === uid) {
          baseLayer = l;
        }
      });
    return baseLayer;
  };

  const getLayer = (uid: string | null): VectorLayer<Feature> | null => {
    let vectorLayer: VectorLayer<Feature> | null = null;
    const baseLayer = getBaseLayer(uid);
    if (baseLayer) {
      vectorLayer = baseLayer as VectorLayer<Feature>;
    }
    return vectorLayer;
  };

  useEffect(() => {
    const points: Location[] = [];

    for (const key of Object.keys(cacheEntries)) {
      const entry: any = cacheEntries[key];
      if (isWaypoint(entry)) {
        const waypoint = entry as Waypoint;

        const layer = getLayer(waypoint.ol_uid);
        let feature;
        let featureUid;
        if (layer != null) {
          const features = layer.getSource()?.getFeatures();
          if (features) {
            const feature = features[0];
            if (feature) {
              featureUid = getUid(feature);
            }
          }
        }

        let description = '[place name]';
        const properties: any = waypoint.properties;
        if (Object.keys(properties).includes('description')) {
          description = properties['description'];
        }

        points.push({
          lon: parseFloat(waypoint.longitude).toFixed(4),
          lat: parseFloat(waypoint.latitude).toFixed(4),
          description: description,
          waypointId: key,
          layerUid: waypoint.ol_uid,
          featureUid: featureUid,
          isSelected: selectedFeatureUid === featureUid,
        });
      }
    }
    setLocations(points);
  }, [cacheEntries, selectedFeatureUid]);

  /*
    const deleteByIndex = (index : Number) => {
      setWaypoints(oldValues => {
        return oldValues.filter((_, i) => i !== index)
      })
    }
    */

  const updateDescriptionByIndex = (index: number, value: string) => {
    console.log('updateDescription: [' + index + '] : ' + value);

    let waypointId: string | undefined;

    setLocations((oldValues) => {
      return oldValues.map((loc, i) => {
        const newLoc = { ...loc };
        if (i === index) {
          newLoc.description = value;
          waypointId = loc.waypointId;
        }
        return newLoc;
      });
    });

    // Also need to sync this back to the cache entry
    if (waypointId) {
      const entry: Entry = cacheEntries[waypointId];
      if (entry && isWaypoint(entry)) {
        const waypoint = entry as Waypoint;
        const properties = { ...waypoint.properties, description: value };
        const updates: Update = { id: waypointId, properties: properties };
        dispatch(update(updates));
      }
    }
  };

  return (
    <div>
      <div className="locations-list">
        {locations.map((object, i) => (
          <div
            className={`location-list-item${object.isSelected ? '-selected' : ''}`}
            key={i}
          >
            <span>{i}:</span>&nbsp;
            <input
              type="text"
              defaultValue={object.description}
              value={object.description}
              onChange={(e) => {
                console.log('LocationsList onChange()');
                console.log('clicked' + i);
                updateDescriptionByIndex(i, e.target.value);
              }}
            />
            &nbsp;&nbsp;
            <span>Lat/lon:</span>
            <span>
              {object.lat}/{object.lon}
            </span>
            &nbsp;&nbsp;
            <button
              onClick={(e) => {
                console.log('LocationsList handleClick()');
                console.log('clicked' + i);
                //e.stopPropagation();
                //e.preventDefault();

                // remove from locations list
                //deleteByIndex(i);

                // remove the layer from the map
                if (object.layerUid) {
                  const layer = getBaseLayer(object.layerUid);
                  if (layer) {
                    map.removeLayer(layer);
                  }
                }

                // remove the underlying waypoint object from the cache
                if (object.waypointId) {
                  dispatch(remove({ id: object.waypointId }));
                }
              }}
            >
              Delete
            </button>
            <br />
          </div>
        ))}
        <br />
        <button
          onClick={(e) => {
            console.log('LocationsList handleClick()');
            dispatch(updateMode('edit'));
            //e.stopPropagation();
            //e.preventDefault();
          }}
        >
          Add Places ...
        </button>
        &nbsp;&nbsp;
        <button
          onClick={(e) => {
            console.log(locations);
            dispatch(updateMode('view'));
            setReportMode(true);
            //e.stopPropagation();
            //e.preventDefault();
          }}
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default LocationsList;
