import type { WaypointJson } from '../io/types';

const waypoints: { [keys: string]: WaypointJson } = {
  '1': {
    id: 'PS',
    latitude: {
      value: 67.99979554747836,
      unit: 'dd',
    },
    longitude: {
      value: 24.195212813012034,
      unit: 'dd',
    },
    name: 'Pallas South',
  },
  '2': {
    id: 'PW',
    latitude: {
      value: 68.02133661494679,
      unit: 'dd',
    },
    longitude: {
      value: 24.162019183033014,
      unit: 'dd',
    },
    name: 'Pallas West',
  },
  '3': {
    id: 'PN',
    latitude: {
      value: 68.05175701364794,
      unit: 'dd',
    },
    longitude: {
      value: 24.18084541500798,
      unit: 'dd',
    },
    name: 'Pallas North',
  },
  '4': {
    id: 'PE',
    latitude: {
      value: 68.02913102263878,
      unit: 'dd',
    },
    longitude: {
      value: 24.28240802153148,
      unit: 'dd',
    },
    name: 'Pallas East',
  },


};

export default waypoints;
