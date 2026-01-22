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
  selectVerticalLevel,
  FeatureAtClick,
} from '../../mapping/mapSlice';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import PopUp from './PopUp';

//import WaypointSourceLayer from './WaypointSourceLayer';

//import { selectMode } from './waypointSlice';

export interface GeoJSONFeatureData {
  //        dataSource: geojsonFeature.source,
  //        dataType: geojsonFeature.ObjectType,
  //        dataValue: geojsonFeature.contourRange,
  //        dataUnit: geojsonFeature.unit,

  dataValue: string | number;
  dataVariableName: string;
}

interface Props {
  sourceIdentifier: string;
  cache: Cache;
}

const PopUpListener = ({ sourceIdentifier, cache }: Props) => {
  const dispatch = useDispatch();
  const clickEvent = useSelector(selectClickEvent);
  const featuresAtClick = useSelector(selectFeaturesAtClick);
  const map = OpenLayersMap.map;

  const [clickedFeature, setClickedFeature] =
    useState<GeoJSONFeatureData | null>(null);
  const [clickCoordinate, setClickCoordinate] = useState<number[]>([]);

  useEffect(() => {
    if (!clickEvent) {
      return;
    }

    // detect click on exisiting point
    //const pointBools: FeatureAtClick[] = featuresAtClick.filter(
    //  (feature: FeatureAtClick) => feature.geometry === 'Point',
    //);

    //if (pointBools.length > 0) {
    if (featuresAtClick.length == 0) {
      console.log('NO FEATURES AT CLICK'); // + geojsonFeature.ol_uid);
      //return;
    } else {
      console.log('FEATURES AT CLICK'); // + geojsonFeature.ol_uid);
    }

    setClickCoordinate([clickEvent.longitude, clickEvent.latitude]);

    //    Filter all clicked geojson featuresso that the prescribed properties
    // match those define in geojsonFilter

    const geojsonFilter: { [key: string]: string } = {
      //source: sourceIdentifier,
      //ObjectType: 'data-contour',
    };

    featuresAtClick.map((feature) =>
      Object.keys(feature).map((key) =>
        console.log('F[' + key + ']: ' + feature[key]),
      ),
    );

    const geojsonFeatures = featuresAtClick.filter((feature) =>
      Object.keys(geojsonFilter)
        .map((key) => feature[key] === geojsonFilter[key])
        .every(Boolean),
    );

    let featureData: GeoJSONFeatureData | null = null;

    if (geojsonFeatures.length > 0) {
      const geojsonFeature = geojsonFeatures[0];
      featureData = {
        //dataSource: geojsonFeature.source,
        //dataType: geojsonFeature.ObjectType,
        dataValue: geojsonFeature['level_value'],
        dataVariableName: 'level_value', //'Day_Of_Year_Range', // TODO
        //dataUnit: geojsonFeature.unit,
      };
    }

    setClickedFeature(featureData);

    /*
    const uid = 'id' + new Date().getTime();
    dispatch(
      request({
        source: sourceIdentifier,
        mode: mode,
        id: uid,
        ...clickEvent,
        properties: {
          ...featureData,
          time: displayTime,
          verticalLevel: verticalLevel,
        },
      }),
    );
    */
  }, [clickEvent]);

  return (
    <PopUp map={map} feature={clickedFeature} coordinate={clickCoordinate} />
  );
};

export default PopUpListener;
