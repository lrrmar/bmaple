import React, { useDebugValue, useEffect, useState } from 'react';
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from '../../../hooks';
import { selectCache, ingest, Ingest } from '../../../mapping/cacheSlice';
import { current } from '@reduxjs/toolkit';
import Feature from 'ol/Feature.js';
import Polygon from 'ol/geom/Polygon.js';
import { Text } from 'ol/style';
import { Coordinate } from 'ol/coordinate';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import openLayersMap from '../../../mapping/OpenLayersMap';
import { Style } from 'ol/style';
import { Stroke, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getUid } from 'ol/util';
import { wait } from '@testing-library/user-event/dist/utils';
import { selectBaseUrl, selectToken } from '../fastaSlice';

const CapLayer = ({
  id,
  sourceIdentifier,
}: {
  id: string;
  sourceIdentifier: string;
}) => {
  const dispatch = useDispatch();
  const [currentPoly, setCurrentPoly] = useState<string>();
  const [currentText, setCurrentText] = useState<string>();
  const layerCache = useSelector(selectCache);
  const fastaBaseUrl = useSelector(selectBaseUrl);
  const fastaToken = useSelector(selectToken);

  const fetchPolygonData = async (id: string) => {
    let polyStr: string;
    try {
      if (layerCache[id]) {
        const cacheElem = layerCache[id];
        const link = String(cacheElem['link']);

        const fullLink = `https://${fastaBaseUrl}/api/v1/proxy/?token=${fastaToken}&url=${link}`;

        const xmlFile = await fetch(fullLink);
        const xmlText = await xmlFile.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const polygonData = xmlDoc.querySelector('polygon')?.innerHTML;
        if (polygonData) {
          polyStr = polygonData;
          const descriptionStr =
            String(cacheElem?.event) + ' \n' + String(cacheElem?.severity);
          setCurrentPoly(polyStr);
          setCurrentText(descriptionStr);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get data from cap warnings
  useEffect(() => {
    // if ol_uid already exists, dont fetch
    const element = layerCache[id];

    let flag = true;
    Object.keys(element).forEach((key: string) => {
      if (key === 'ol_uid') flag = false;
    });
    if (flag) {
      fetchPolygonData(id);
    }
  }, []);

  // create vector layers using the polygon data
  useEffect(() => {
    const latlonArr: Coordinate[] = [];
    if (currentPoly) {
      const polygon = currentPoly;
      const latlonPairs = polygon.split(' ');
      latlonPairs.map((latLonString) => {
        const separate = latLonString.split(',');
        const lonLatFloat = [parseFloat(separate[1]), parseFloat(separate[0])];
        const coords = fromLonLat(lonLatFloat);

        latlonArr.push(coords);
      });
      try {
        const styles = new Style({
          stroke: new Stroke({
            color: 'black',
            width: 2,
          }),
          fill: new Fill({
            color: 'orange',
          }),
          text: new Text({
            textAlign: 'center',
            font: '16px bold Arial',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 4 }),
            text: currentText,
            offsetX: 0,
            offsetY: 0,
          }),
        });

        const feature = new Feature({
          geometry: new Polygon([latlonArr]),
        });

        const source = new VectorSource({
          features: [feature],
        });

        const layer = new VectorLayer({
          source: source,
          style: styles,
          visible: false,
        });
        layer.setZIndex(2);
        feature.set('layer_id', getUid(layer));

        const map = openLayersMap.map;
        map.addLayer(layer);
        const oldLayer = layerCache[id];
        const toCache: Ingest = {
          id: id,
          country: oldLayer.country,
          source: 'cap',
          ol_uid: getUid(layer),
          end: oldLayer.end,
          event: oldLayer.event,
          severity: oldLayer.severity,
          start: oldLayer.start,
          link: oldLayer.link,
          fastaId: oldLayer.fastaId,
        };
        dispatch(ingest(toCache));
      } catch (error) {
        console.log('ERROR', error);
      }
    }
  }, [currentPoly]);
  return <div></div>;
};
export default CapLayer;
