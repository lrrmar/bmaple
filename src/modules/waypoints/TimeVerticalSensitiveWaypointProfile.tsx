import React, { useEffect, useState, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import VectorLayer from 'ol/layer/Vector';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Style, Stroke, Circle, Fill, RegularShape } from 'ol/style';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  selectCache,
  Cache,
  selectCacheEntries,
  Entry,
  isEntry,
  CacheElement,
} from '../../mapping/cacheSlice';

import { selectDisplayTime } from '../../mapping/mapSlice';
import { selectVerticalLevel } from '../force-geojson-field/geojsonFieldSlice';
import { selectHighlightedWaypoints } from './waypointSlice';

interface Waypoint extends Entry {
  longitude: string;
  latitude: string;
  time: string;
  verticalLevel: string;
  id: string;
  dataSource?: string;
  dataType?: string;
  dataValue?: string;
  dataVariable?: string;
  dataUnit?: string;
}

export const isWaypoint = (element: any): element is Waypoint => {
  const keys: string[] = Object.keys(element);
  return (
    isEntry(element) &&
    keys.includes('latitude') &&
    keys.includes('longitude') &&
    keys.includes('time') &&
    keys.includes('verticalLevel')
  );
};

interface OpenLayerPointProps {
  waypointData: Waypoint;
}
const circleStyle = (fill: string, stroke: string): Style => {
  const st = new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({
        color: fill,
      }),
      stroke: new Stroke({
        color: stroke,
        width: 1.5,
      }),
    }),
  });
  return st;
};

const tearDropStyle = (
  fill: string,
  stroke: string,
  rotation: number,
): Style[] => {
  const triangle: Style = new Style({
    image: new RegularShape({
      points: 3, // Triangle
      radius: 3.5,
      rotation: rotation, // Flip the triangle downwards
      displacement: [0, 7.8], // Adjust position so it sits on top of the circle
      fill: new Fill({ color: stroke }),
      stroke: new Stroke({ color: stroke, width: 0 }),
    }),
  });
  // Second shape: Circle
  const circle: Style = circleStyle(fill, stroke);
  return [circle, triangle];
};
const OpenLayerPoint = ({ waypointData }: OpenLayerPointProps) => {
  const map = OpenLayersMap.map;
  const mapUtils = new OpenLayersMap();
  const unhighlightedStrokeColour = '#111111';
  const highlightedStrokeColour = '#ffffff';
  const nowFillColour = '#1976d2';
  const futureFillColour = '#ffffff00';
  const waypointTime = new Date(waypointData.time);
  const waypointLevel = waypointData.verticalLevel
    ? waypointData.verticalLevel
    : 0;
  const displayTime = new Date(useSelector(selectDisplayTime));
  const verticalLevel = useSelector(selectVerticalLevel);
  const highlightedWaypoints = useSelector(selectHighlightedWaypoints);
  const displayLevel = verticalLevel ? verticalLevel : 0;
  //const displayLevel: number = verticalLevel ? new Number(verticalLevel.replace(/[^a-zA-Z]/g, '')) : 0 ;

  // Find stroke colour depending on highlighting
  let strokeColour: string;
  if (highlightedWaypoints.includes(waypointData.id)) {
    strokeColour = highlightedStrokeColour;
  } else {
    strokeColour = unhighlightedStrokeColour;
  }
  // Find colours depending on time placement of waypoint
  const pastFillColour = strokeColour;
  let fillColour: string;
  if (waypointTime.getTime() == displayTime.getTime()) {
    fillColour = nowFillColour;
  } else {
    fillColour = waypointTime < displayTime ? pastFillColour : futureFillColour;
  }

  // Find shape depending on vertical placement of waypoint
  let pointStyle: Style | Style[];
  if (waypointLevel == displayLevel) {
    pointStyle = circleStyle(fillColour, strokeColour);
  } else {
    const rotation = waypointLevel < displayLevel ? 0 : Math.PI;
    pointStyle = tearDropStyle(fillColour, strokeColour, rotation);
  }
  let olLayer: VectorLayer<Feature> | undefined;
  if (waypointData.ol_uid)
    olLayer = mapUtils.getLayerByUid(waypointData.ol_uid);
  if (olLayer) {
    const source: VectorSource | null = olLayer.getSource();
    if (source) {
      const points: Feature[] = source.getFeatures().filter((feature) => {
        const geometry: Geometry | undefined = feature.getGeometry();
        return geometry ? geometry.getType() === 'Point' : false;
      });
      points.map((feature) => feature.setStyle(pointStyle));
      olLayer.setVisible(true);
    }
  }

  return null;
};

const Graphics = () => {
  //const profileIds = useSelector(selectProfileIds);
  const [pointsToRender, setPointsToRender] = useState<React.ReactNode[]>([]);
  const cacheEntries: { [key: string]: Entry } =
    useSelector(selectCacheEntries);

  useEffect(() => {
    const waypoints: Waypoint[] =
      Object.values(cacheEntries).filter(isWaypoint);
    const points: React.ReactNode[] = waypoints.map((data) => {
      return <OpenLayerPoint key={data.ol_uid} waypointData={data} />;
    });
    setPointsToRender(points);
  }, [cacheEntries]);

  return <div className="Graphics">{pointsToRender}</div>;
};

//const Behaviours = ({ waypointsData }) => {
//  const print = useSelector(selectPrintWaypointJSON);
//
//  useEffect(() => {
//    if (waypointsData.length < 1) {return};
//    const strippedData = waypointsData.map((data) => {
//      const d = {...data};
//      delete d.ol_uid;
//      delete d.source;
//      return d;
//    });
//    const json = JSON.stringify({waypoints: strippedData}, null, 2);
//    const blob = new Blob([json], {type: 'application/json'});
//    const href = URL.createObjectURL(blob);
//    const link = document.createElement('a');
//    link.href = href;
//    link.download = 'waypoints.json';
//    document.body.appendChild(link);
//    link.click()
//    document.body.removeChild(link);
//    URL.revokeObjectURL(href);
//
//  }, [print]);
//};
//

const WaypointGraphic = () => {
  return (
    <div className="WaypointGraphic">
      <Graphics />
    </div>
  );
};

export default WaypointGraphic;
