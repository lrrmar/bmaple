import React, { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CacheElement, selectCache } from '../../../mapping/cacheSlice';
import './capPanel.css';
import PopUp from '../../../features/PopUp';
import { selectCountry, selectOluid, selectSeverity } from './capSlice';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { Geometry, Polygon, SimpleGeometry } from 'ol/geom';
import { getUid } from 'ol/util';
import BaseLayer from 'ol/layer/Base';
import OpenLayersMap from '../../../mapping/OpenLayersMap';
import { Coordinate } from 'ol/coordinate';
import IconReference from '../../../features/FoldOutMenu/icons-reference';

/*
  CAP PANEL COMPONENT:
    ~ Get all of the CAP warnings from cache
    ~ Make a dynamic list of all caps 
    ~ List should be clickable
    ~ On click, a pop up should come up that displays all the information for the CAP
*/

const CapPanel = ({ id }: { id: string }) => {
  const [capList, setCapList] = useState<string[]>([]);
  const [openPopup, setOpenPopUp] = useState<boolean>(false);
  const [cacheObj, setCacheObj] = useState<CacheElement>();

  const map = OpenLayersMap.map;
  const currentCountry = useSelector(selectCountry);
  const currentSeverity = useSelector(selectSeverity);
  const currentOluid = useSelector(selectOluid);
  const allCache = useSelector(selectCache);

  const getLayer = (
    uid: string | null,
  ): VectorLayer<Feature<Geometry>> | null => {
    let baseLayer: BaseLayer | undefined = undefined;
    let vectorTileLayer: VectorLayer<Feature<Geometry>> | null = null;
    map
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (getUid(layer) === uid) {
          baseLayer = layer;
        }
      });

    if (baseLayer) {
      vectorTileLayer = baseLayer as VectorLayer<Feature<Geometry>>;
    }
    return vectorTileLayer;
  };

  const getURL = () => {
    return String(cacheObj?.link);
  };

  const getEventByID = (id: string) => {
    return String(allCache[id].event);
  };

  const getCountryByID = (id: string) => {
    return String(allCache[id].country);
  };

  // finds the coordinates of the selected polygon and sets it to the centre of the view
  const centreScreenOnPolygon = (id: string) => {
    if (id) {
      const layer = getLayer(id);
      const source = layer?.getSource();
      const features = source?.getFeatures()[0];
      const polygon = features?.getGeometry() as SimpleGeometry;
      if (polygon.getCoordinates()) {
        const coords = polygon.getFirstCoordinate() as Coordinate;
        map.getView().setZoom(7);
        map.getView().setCenter(coords);
      }
    }
  };

  // get updated cap list every time the cache is changed
  useEffect(() => {
    const filteredIds = Object.keys(allCache).filter((id) => {
      const cap = allCache[id];
      const matchesSource = cap?.source === 'cap';
      const hasUID = !!cap?.ol_uid;
      const matchesOLUID =
        currentOluid[Object.keys(currentOluid)[0]]?.includes(
          String(cap?.ol_uid),
        ) || Object.keys(currentOluid)[0] === 'All';
      const matchesCountry =
        cap?.country === currentCountry || currentCountry === 'All';
      const matchesSeverity =
        cap?.severity === currentSeverity || currentSeverity === 'All';
      return (
        matchesSource &&
        hasUID &&
        matchesCountry &&
        matchesSeverity &&
        matchesOLUID
      );
    });

    setCapList(filteredIds);
  }, [allCache, currentCountry, currentSeverity, currentOluid]);

  return (
    <>
      {!openPopup ? (
        <div className="scrollable" id={id}>
          <label className="h2" htmlFor="capList">
            CAP List:{' '}
          </label>
          <div id="capList">
            {capList.map((capId, i) => (
              <button
                className="button-cap"
                onClick={() => {
                  setOpenPopUp(true);
                  setCacheObj(allCache[capId]);
                }}
                key={i}
                value={capId}
              >
                <h1>
                  <IconReference name="moderate" />
                </h1>
                <h2>{getEventByID(capId)}</h2>
                <h3>{getCountryByID(capId)}</h3>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="div-info">
        <PopUp showPopUp={openPopup} closePopUp={() => setOpenPopUp(false)}>
          <p>
            <i>Event</i> : {String(cacheObj?.event)} <br />
            <i>Severity</i>: {String(cacheObj?.severity)}
            <br />
            <i>Country</i>: {String(cacheObj?.country)}
            <br />
            <i>Start Date/Time</i>: {String(cacheObj?.start)}
            <br />
            <i>End Date/Time</i>: {String(cacheObj?.end)}
            <br />
            <a className="a-cap" href={getURL()}>
              <i>Link to CAP</i>
            </a>
            <br />
          </p>

          <button
            onClick={() => centreScreenOnPolygon(String(cacheObj?.ol_uid))}
          >
            Find CAP!
          </button>
        </PopUp>
      </div>
    </>
  );
};

export default CapPanel;
