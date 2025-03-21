import React, { useEffect, useState } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../hooks';

import { selectCache, Cache, Request, request } from '../../mapping/cacheSlice';

import {
  selectClickEvent,
  selectFeaturesAtClick,
  selectDisplayTime,
  FeatureAtClick,
} from '../../mapping/mapSlice';

import { selectVerticalLevel } from '../force-geojson-field/geojsonFieldSlice';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import WaypointSourceLayer from './WaypointSourceLayer';

import { selectMode } from './waypointSlice';

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const WaypointSource = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const clickEvent = useSelector(selectClickEvent);
  const featuresAtClick = useSelector(selectFeaturesAtClick);
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const mode = useSelector(selectMode);
  const [clickEvents, setClickEvents] = useState([]);

  useEffect(() => {
    if (!clickEvent) {
      return;
    }
    // detect click on exisiting point
    const pointBools: FeatureAtClick[] = featuresAtClick.filter(
      (feature: FeatureAtClick) => feature.geometry === 'Point',
    );
    if (pointBools.length > 0) {
      return;
    }

    //    Filter all clicked geojson featuresso that the prescribed properties
    // match those define in geojsonFilter

    const geojsonFilter: { [key: string]: string } = {
      source: sourceIdentifier,
      ObjectType: 'contour',
    };

    const geojsonFeatures = featuresAtClick.filter((feature) =>
      Object.keys(geojsonFilter)
        .map((key) => feature[key] === geojsonFilter[key])
        .every(Boolean),
    );
    const geojsonFeature = geojsonFeatures[0];

    let featureData;
    if (geojsonFeature) {
      featureData = {
        dataSource: geojsonFeature.source,
        dataType: geojsonFeature.ObjectType,
        dataValue: geojsonFeature.contourRange,
        dataVariable: geojsonFeature.variable,
        dataUnit: geojsonFeature.unit,
      };
    }
    const uid = 'id' + new Date().getTime();
    dispatch(
      request({
        source: sourceIdentifier,
        mode: mode,
        id: uid,
        ...clickEvent,
        time: displayTime,
        verticalLevel: verticalLevel,
        ...featureData,
      }),
    );
  }, [clickEvent]);

  const sourcesToLoad = Object.keys(cache).map((id) => {
    return (
      <WaypointSourceLayer
        key={id}
        id={id}
        sourceIdentifier={sourceIdentifier}
      />
    );
  });

  return <div className="WaypointSource">{sourcesToLoad}</div>;
};

export default WaypointSource;
