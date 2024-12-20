import React, { useEffect, useState, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import VectorLayer from 'ol/layer/Vector';
import BaseLayer from 'ol/layer/Base';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { get } from 'ol/proj';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import {
  selectCache,
  Cache,
  selectCacheEntries,
  Entry,
  isEntry,
  CacheElement,
} from '../../mapping/cacheSlice';

interface Waypoint extends Entry {
  longitude: string;
  latitude: string;
  time: string;
  verticalLevel: string;
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
const OpenLayerPoint = ({ waypointData }: OpenLayerPointProps) => {
  const map = OpenLayersMap.map;
  const mapUtils = new OpenLayersMap();
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
      points.map((feature) => {
        const pointStyle = new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({
              color: '#ffffff',
            }),
            stroke: new Stroke({
              color: '#000000',
              width: 2,
            }),
          }),
        });
        feature.setStyle(pointStyle);
      });
    }
    olLayer.setVisible(true);
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
