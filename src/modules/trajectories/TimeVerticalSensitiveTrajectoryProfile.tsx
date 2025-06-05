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
import { selectHighlightedTrajectories } from './trajectoriesSlice';
import { Trajectory, isTrajectory, isEntryTrajectory } from './TrajectoryLayer';

interface OpenLayersLineStringProps {
  trajectoryData: Trajectory;
}
const strokeStyle = (colour: string, width: number): Style => {
  const st = new Style({
    stroke: new Stroke({
      color: colour,
      width: width,
    }),
  });
  return st;
};

const OpenLayersLineString = ({
  trajectoryData,
}: OpenLayersLineStringProps) => {
  const map = OpenLayersMap.map;
  const mapUtils = new OpenLayersMap();
  const unhighlightedStrokeColour = '#111111';
  const highlightedStrokeColour = '#ffffff';
  const unhighlightedWidth = 1;
  const highlightedWidth = 3;
  const nowFillColour = '#1976d2';
  const futureFillColour = '#ffffff';
  /*const trajectoryTime = new Date(trajectoryData.time);
  const trajectoryLevel = trajectoryData.verticalLevel
    ? trajectoryData.verticalLevel
    : 0;*/
  const displayTime = new Date(useSelector(selectDisplayTime));
  const verticalLevel = useSelector(selectVerticalLevel);
  const highlightedTrajectories = useSelector(selectHighlightedTrajectories);
  const displayLevel = verticalLevel ? verticalLevel : 0;
  //const displayLevel: number = verticalLevel ? new Number(verticalLevel.replace(/[^a-zA-Z]/g, '')) : 0 ;

  // Find radius (previously stroke colour) depending on highlighting
  const strokeColour = unhighlightedStrokeColour;
  let width: number;
  if (highlightedTrajectories.includes(trajectoryData.id)) {
    width = highlightedWidth;
  } else {
    width = unhighlightedWidth;
  }
  // Find colours depending on time placement of trajectory

  /*const pastFillColour = strokeColour;
  let fillColour: string;
  if (trajectoryTime.getTime() == displayTime.getTime()) {
    fillColour = nowFillColour;
  } else {
    fillColour =
      trajectoryTime < displayTime ? pastFillColour : futureFillColour;
  }
  */

  // Find shape depending on vertical placement of trajectory
  //if (trajectoryLevel == displayLevel) {
  const stroke = strokeStyle(strokeColour, width);
  //} else {
  /*
    const rotation = trajectoryLevel < displayLevel ? 0 : Math.PI;
    stroke = tearDropStyle(fillColour, strokeColour, rotation, radius);
  */
  //}
  let olLayer: VectorLayer<Feature> | undefined;
  if (trajectoryData.ol_uid)
    olLayer = mapUtils.getLayerByUid(trajectoryData.ol_uid);
  if (olLayer) {
    const source: VectorSource | null = olLayer.getSource();
    if (source) {
      const lineStrings: Feature[] = source.getFeatures().filter((feature) => {
        const geometry: Geometry | undefined = feature.getGeometry();
        return geometry ? geometry.getType() === 'LineString' : false;
      });
      lineStrings.map((feature) => feature.setStyle(stroke));
      olLayer.setVisible(true);
    }
  }

  return null;
};

const Graphics = () => {
  //const profileIds = useSelector(selectProfileIds);
  const [lineStringsToRender, setLineStringsToRender] = useState<
    React.ReactNode[]
  >([]);
  const cacheEntries: { [key: string]: Entry } =
    useSelector(selectCacheEntries);

  useEffect(() => {
    const trajectoryCacheEntries: Trajectory[] =
      Object.values(cacheEntries).filter(isEntryTrajectory);
    const lineStringComponents: React.ReactNode[] = trajectoryCacheEntries.map(
      (data) => {
        return <OpenLayersLineString key={data.ol_uid} trajectoryData={data} />;
      },
    );
    setLineStringsToRender(lineStringComponents);
  }, [cacheEntries]);

  return <div className="Graphics">{lineStringsToRender}</div>;
};

//const Behaviours = ({ trajectorysData }) => {
//  const print = useSelector(selectPrintTrajectoryJSON);
//
//  useEffect(() => {
//    if (trajectorysData.length < 1) {return};
//    const strippedData = trajectorysData.map((data) => {
//      const d = {...data};
//      delete d.ol_uid;
//      delete d.source;
//      return d;
//    });
//    const json = JSON.stringify({trajectorys: strippedData}, null, 2);
//    const blob = new Blob([json], {type: 'application/json'});
//    const href = URL.createObjectURL(blob);
//    const link = document.createElement('a');
//    link.href = href;
//    link.download = 'trajectorys.json';
//    document.body.appendChild(link);
//    link.click()
//    document.body.removeChild(link);
//    URL.revokeObjectURL(href);
//
//  }, [print]);
//};
//

const TrajectoryGraphic = () => {
  return (
    <div className="TrajectoryGraphic">
      <Graphics />
    </div>
  );
};

export default TrajectoryGraphic;
