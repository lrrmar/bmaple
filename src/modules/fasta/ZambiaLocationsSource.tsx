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
import WaypointSourceLayer from '../waypoints/WaypointSourceLayer';
import { Location, LocationsList } from './LocationsList';
import { selectMode } from '../waypoints/waypointSlice';
import { selectZmFlag, updateZmFlag } from '../fasta/fastaSlice';

interface Props {
  sourceIdentifier: string;
}

const ZambiaLocationsSource = ({ sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const mode = useSelector(selectMode);
  const flag = useSelector(selectZmFlag);    

  var requests : Request[] = [];

  const defaults : Location = {
      description: "", lat: "", lon: "",
      waypointId: "", layerUid:undefined, featureUid:undefined,
      isSelected:false,
    };

  var places : Location[] = [
        { ...defaults, description: "Lusaka, Lusaka Province", lat: "-15.407", lon: "28.287", waypointId: "ZAMBIA_LOC_1"},
        { ...defaults, description: "Ndola, Copperbelt", lat: "-12.959", lon: "28.637", waypointId: "ZAMBIA_LOC_2"},
        { ...defaults, description: "Kasama, Northern Province", lat: "-10.213", lon: "31.181", waypointId: "ZAMBIA_LOC_3"},
        { ...defaults, description: "Chinsali, Muchinga ", lat:"-10.552", lon :"32.069", waypointId: "ZAMBIA_LOC_4"},
        { ...defaults, description: "Kabwe, Central Province", lat:	"-14.447", lon: "28.446", waypointId: "ZAMBIA_LOC_5"},
        { ...defaults, description: "Livingstone, Southern Province", lat: "-17.842", lon: "25.854", waypointId: "ZAMBIA_LOC_6"},
        { ...defaults, description: "Mongu, Western", lat: "-15.248", lon: "23.127", waypointId: "ZAMBIA_LOC_7"},
        { ...defaults, description: "Mansa, Luapula",  lat: "-11.200", lon: "28.894", waypointId: "ZAMBIA_LOC_8"},
        { ...defaults, description: "Solwezi, North-Western", lat: "-12.169", lon: "26.389", waypointId: "ZAMBIA_LOC_9"},
        { ...defaults, description: "Chipata, Eastern Province", lat: "-13.633", lon: "32.65", waypointId: "ZAMBIA_LOC_10"}
  ];


  useEffect(() => {

    if (flag) { return; }

    requests = places.map( (loc : Location, index: number) => {
      return {
        source: sourceIdentifier,
        mode: mode,
        id: loc.waypointId,
        latitude: loc.lat,
        longitude: loc.lon,
        properties: {
          time: displayTime,
          verticalLevel: verticalLevel,
          description: loc.description,
        }
      }
    });

    requests.forEach( (req) => {
      console.log("sending request ..." + req.id);
      dispatch(request(req))
    });

    dispatch(updateZmFlag(true));
  }, []);

  const sourcesToLoad = requests.map((req) => {
    return (
      <WaypointSourceLayer
        key={req.id}
        id={req.id}
        sourceIdentifier={sourceIdentifier}
      />
    );
  });

  return <div className="ZambiaLocationsSource">{sourcesToLoad}</div>;
};

export default ZambiaLocationsSource;
