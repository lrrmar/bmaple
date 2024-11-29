import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Map.css';
import MapType from 'ol/Map';
import { toLonLat, fromLonLat } from 'ol/proj';

import {
  selectCenter,
  selectZoom,
  updateClickEvent,
  updateFeaturesAtClick,
} from './mapSlice';
import OpenLayersMap from './OpenLayersMap';

// TODO
//
// -[ ] see where interfaces could be used, especially when calling for ._values from th map,
//   could give weird results...
// -[ ] Docs...

type Props = {
  children: React.ReactNode;
};

const Map = ({ children }: Props) => {
  /* This component is the React representation of the OpenLayers Map, it:
   * - mounts the O.L. Map into the 'ol-map' <div>.
   * - captures map interactions e.g. clicks and dispatches them to the map
   *   slice.
   * - is the only component that the calling of methods on the O.L Map,
   *   apart from addLayer(), removeLayer() and getLayers().
   */

  const dispatch = useDispatch();
  const mapRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [map, setMap] = useState<MapType | null>(null);
  const [mouseIsDragging, setMouseIsDragging] = useState<boolean>(false);

  /* selectors */

  const mapCenter: number[] | null = useSelector(selectCenter);
  const mapZoom: number | null = useSelector(selectZoom);

  // on component mount
  useEffect(() => {
    if (!mapRef.current) return;
    const mapToMount = OpenLayersMap.map;
    mapToMount.setTarget(mapRef.current);
    mapToMount.updateSize();
    setMap(mapToMount);
    return () => {
      map === null ? null : map.setTarget(undefined);
    };
  }, [map, mapRef]);

  // zoom change handler
  useEffect(() => {
    if (!map || !mapZoom) return;
    map.getView().setZoom(mapZoom);
  }, [map, mapZoom]);

  // center change handler
  useEffect(() => {
    if (!map || !mapCenter) return;
    map.getView().setCenter(fromLonLat(mapCenter));
  }, [map, mapCenter]);

  /* INTERACTIONS */

  function handleMouseMove(e: React.MouseEvent<HTMLElement>): void {
    setMouseIsDragging(true);
    const posX: number = e.clientX - 50;
    const posY: number = e.clientY - 50;
    //dispatch(updateMouseLocation([posX, posY]));
  }

  function handleMouseDown(): void {
    setMouseIsDragging(false);
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLElement>) => {
    if (mouseIsDragging) {
      console.log('dragging');
    } else {
      handleClick(event);
    }
  };

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    if (map === null) {
      return;
    }
    const lonLat: number[] = toLonLat(
      map.getCoordinateFromPixel([e.clientX, e.clientY]),
    );
    const mapCoordinate = {
      longitude: lonLat[0],
      latitude: lonLat[1],
    };
    const featuresAtClick = map
      .getFeaturesAtPixel([e.clientX, e.clientY])
      .map((feature) => {
        const geometry = feature.getGeometry();
        if (!geometry) return;

        const geometryType: string = geometry.getType();
        const ol_uid: string = feature.getProperties()['ol_uid'];
        if (!ol_uid) return;

        const values: { [key: string]: string | number } = {
          ...feature.getProperties(),
        }; // get type
        delete values.geometry;
        const info = {
          ol_uid: feature.getProperties()['ol_uid'],
          geometry: geometryType,
          ...values,
        };
        return info;
      });
    dispatch(updateClickEvent(mapCoordinate));
    dispatch(updateFeaturesAtClick(featuresAtClick));
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={mapRef}
      className="ol-map"
    >
      {children}
    </div>
  );
};

export default Map;
