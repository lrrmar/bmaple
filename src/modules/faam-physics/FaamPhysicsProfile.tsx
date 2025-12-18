import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../../hooks';
import { selectCache, isEntry, CacheElement } from '../../mapping/cacheSlice';
import { selectCurrentLayerName, selectOpacity } from './faamPhysicsSlice';
import { isEntryFaamPhysics } from './FaamPhysicsLayer';
import { selectHighlightedTrajectories, selectCurrentTrajectoryWaypoints } from '../trajectories/trajectoriesSlice';
import { Waypoint } from '../waypoints/waypointSlice';
import { isWaypoint } from '../waypoints/waypointSlice';
import OpenLayersMap from '../../mapping/OpenLayersMap';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { Circle } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';

import { selectVerticalLevel, selectDisplayTime } from '../../mapping/mapSlice';

import { maximumHorizontalDistance } from './utils';

const FaamPhysicsProfile = () => {
  const cache = useSelector(selectCache);
  const opacity = useSelector(selectOpacity);
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const trajectoryId = useSelector(selectHighlightedTrajectories);
  const currentTrajectoryWaypoints = useSelector(selectCurrentTrajectoryWaypoints);

  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [displayedIds, setDisplayedIds] = useState<string[]>([]);

  const loaded = useRef<boolean>(false);

  useEffect(() => {
    // initialise geometry
    const element = cache['faam-ring'];
    if (element && isEntry(element)) {
      const mapUtils = new OpenLayersMap();
      let olLayer: VectorLayer<Feature> | undefined;
      const ol_uid = element.ol_uid;
      if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
      if (olLayer) {
      }
    }
  }, []);

  useEffect(() => {
    let base = 0;
    let time = 1764320400000;
    let waypoints: CacheElement[] = [];
    if (currentTrajectoryWaypoints) {
      const priorTimes: number[] = [];
      let currentTime: null | number = null;
      const postTimes: number[] = [];
      currentTrajectoryWaypoints.forEach((waypoint)=> {
        const waypointTime = waypoint.time;
        if (waypointTime && typeof(waypointTime) == 'number') {
          if (waypointTime == displayTime) {
            currentTime = displayTime;
          } else if (waypointTime < displayTime) {
            priorTimes.push(waypointTime);
          } else if (displayTime < waypointTime) {
            postTimes.push(waypointTime);
          }
        }
      })
      const priorTime = priorTimes[priorTimes.length-1];
      const postTime = postTimes[0];

      if (currentTime) {
        // Already waypoint at the time, no geom
        const currentWaypoint = currentTrajectoryWaypoints.find(waypoint => waypoint.time == currentTime);
        if (currentWaypoint) waypoints = [currentWaypoint];
      } else if (priorTime && !postTime)  {
        // we are after any waypoints in the trajectory
        const priorWaypoint = currentTrajectoryWaypoints.find(waypoint => waypoint.time == priorTime);
        if (priorWaypoint) waypoints = [priorWaypoint];

      } else if (!priorTime && postTime)  {
        // we are before any waypoints in the trajectory
        const postWaypoint = currentTrajectoryWaypoints.find(waypoint => waypoint.time == postTime);
        if (postWaypoint) waypoints = [postWaypoint];

      } else if (priorTime && postTime) {
        // we are between two points in the trajectory
          const priorWaypoint = currentTrajectoryWaypoints.find(waypoint => waypoint.time == priorTime);
         const postWaypoint = currentTrajectoryWaypoints.find(waypoint => waypoint.time == postTime);
        if (priorWaypoint && postWaypoint) waypoints = [priorWaypoint, postWaypoint];
      }
    }

    let coords: number[][] = [];
    if (waypoints.length == 1) { // could do a double here somehow, just need to
                                // pass in the theta lims!
      let theta = 0;
      const waypoint = waypoints[0];
      const waypointTime = waypoint.time;
      const waypointVerticalLevel = waypoint.verticalLevel;
      let z = verticalLevel;
      let z0 = verticalLevel;
      let t = displayTime;
      let t0 = displayTime;
      if (waypointTime < displayTime) {
        z0 = waypointVerticalLevel;
        t0 = waypointTime;
      } else {
        z = waypointVerticalLevel;
        t = waypointTime;
      }
      const radius = maximumHorizontalDistance(z, t, z0, t0);
      while (theta < 2 * Math.PI) {

    }
    const element = cache['faam-ring'];
    if (element && isEntry(element)) {
      const mapUtils = new OpenLayersMap();
      let olLayer: VectorLayer<Feature> | undefined;
      const ol_uid = element.ol_uid;
      if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
      if (olLayer) {
        if (!loaded.current) {
          // Initial render, set style
          console.log('load');
          loaded.current = true;
          olLayer.setStyle(
            new Style({
              stroke: new Stroke({
                color: 'rgba(5,22,255,1)',
                width: 0.7,
              }),
              fill: new Fill({
                color: 'rgba(255,255,255,0.01)',
              }),
            }),
          );
        }

        if (verticalLevel && displayTime) {
          let center = null;
          if (waypoints.length > 0) {
            time = waypoints[0].time;
            base = waypoints[0].verticalLevel;
            center = fromLonLat([waypoints[0].longitude, waypoints[0].latitude]);
          }
          olLayer.setVisible(true);
          const dt = displayTime / (60 * 1000); // ms to mins
          const t = time / (60 * 1000); // ms to mins
          const radius_metres =
            maximumHorizontalDistance(parseInt(verticalLevel), dt, base, t) / 3.3;
          const source = olLayer.getSource();
          if (source) {
            const feature = source.getFeatures()[0];
            if (feature) {
              const circle = feature.getGeometry();
              if (circle && circle instanceof Circle)
                circle.setRadius(radius_metres);
                if (center) circle.setCenter(center);
            }
          }
        } else {
          olLayer.setVisible(false);
        }
      }
    }
    }
  }, [verticalLevel, displayTime, currentTrajectoryWaypoints]);

  useEffect(() => {
    // When opacity changes, change corresponding layers

    displayedIds.forEach((id) => {
      const element = cache[id];
      if (element && isEntry(element)) {
        const mapUtils = new OpenLayersMap();
        let olLayer: VectorLayer<Feature> | undefined;
        const ol_uid = element.ol_uid;
        if (ol_uid) olLayer = mapUtils.getLayerByUid(ol_uid);
        if (olLayer) olLayer.setOpacity(opacity);
      }
    });
  }, [opacity, displayedIds]);

  return <div></div>;
};

export default FaamPhysicsProfile;
