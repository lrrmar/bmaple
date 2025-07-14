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
import { selectMzFlag, updateMzFlag } from '../fasta/fastaSlice';

interface Props {
  sourceIdentifier: string;
}

const MozambiqueLocationsSource = ({ sourceIdentifier }: Props) => {
  const dispatch = useDispatch();
  const displayTime = useSelector(selectDisplayTime);
  const verticalLevel = useSelector(selectVerticalLevel);
  const mode = useSelector(selectMode);
  const flag = useSelector(selectMzFlag);

  let requests: Request[] = [];

  const defaults: Location = {
    description: '',
    lat: '',
    lon: '',
    waypointId: '',
    layerUid: undefined,
    featureUid: undefined,
    isSelected: false,
  };

  const places: Location[] = [
    {
      ...defaults,
      description: 'Maputo',
      lat: '-25.95',
      lon: '32.57',
      waypointId: 'MZ_LOC_1',
    },
    {
      ...defaults,
      description: 'Xai-Xai',
      lat: '-25.06',
      lon: '33.70',
      waypointId: 'MZ_LOC_2',
    },
    {
      ...defaults,
      description: 'Inhambane',
      lat: '-23.88',
      lon: '35.40',
      waypointId: 'MZ_LOC_3',
    },
    {
      ...defaults,
      description: 'Vilanculos',
      lat: '-21.99',
      lon: '35.32',
      waypointId: 'MZ_LOC_4',
    },
    {
      ...defaults,
      description: 'Espungabera',
      lat: '-20.45',
      lon: '32.78',
      waypointId: 'MZ_LOC_5',
    },
    {
      ...defaults,
      description: 'Beira',
      lat: '-19.82',
      lon: '34.86',
      waypointId: 'MZ_LOC_6',
    },
    {
      ...defaults,
      description: 'Chimoio',
      lat: '-19.11',
      lon: '33.47',
      waypointId: 'MZ_LOC_7',
    },
    {
      ...defaults,
      description: 'Quelimane',
      lat: '-17.85',
      lon: '36.90',
      waypointId: 'MZ_LOC_8',
    },
    {
      ...defaults,
      description: 'Tete',
      lat: '-16.13',
      lon: '33.61',
      waypointId: 'MZ_LOC_9',
    },
    {
      ...defaults,
      description: 'Luangwa',
      lat: '-15.62',
      lon: '30.43',
      waypointId: 'MZ_LOC_10',
    },
    {
      ...defaults,
      description: 'Angoche',
      lat: '-16.23',
      lon: '39.91',
      waypointId: 'MZ_LOC_11',
    },
    {
      ...defaults,
      description: 'Nampula',
      lat: '-15.12',
      lon: '36.25',
      waypointId: 'MZ_LOC_12',
    },
    {
      ...defaults,
      description: 'Cuamba',
      lat: '-14.80',
      lon: '36.54',
      waypointId: 'MZ_LOC_13',
    },
    {
      ...defaults,
      description: 'Pemba',
      lat: '-12.97',
      lon: '40.50',
      waypointId: 'MZ_LOC_14',
    },
    {
      ...defaults,
      description: 'Lichinga',
      lat: '-13.30',
      lon: '35.25',
      waypointId: 'MZ_LOC_15',
    },
    {
      ...defaults,
      description: 'Nacala',
      lat: '-14.56',
      lon: '40.69',
      waypointId: 'MZ_LOC_16',
    },
  ];

  useEffect(() => {
    if (flag) {
      return;
    }

    requests = places.map((loc: Location, index: number) => {
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
        },
      };
    });

    requests.forEach((req) => {
      console.log('sending request ...' + req.id);
      dispatch(request(req));
    });

    dispatch(updateMzFlag(true));
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

  return <div className="MozambiqueLocationsSource">{sourcesToLoad}</div>;
};

export default MozambiqueLocationsSource;
