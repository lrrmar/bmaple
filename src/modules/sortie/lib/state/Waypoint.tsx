import type { Waypoint as _Waypoint, LatLonMeasure } from './types';
import type { WaypointJson } from '../io/types';

export default class Waypoint implements _Waypoint {
  id: string;
  name: string;
  latitude: LatLonMeasure;
  longitude: LatLonMeasure;
  constructor(
    id: string,
    name: string,
    latitude: LatLonMeasure,
    longitude: LatLonMeasure,
  ) {
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  toJson(): WaypointJson {
    return {
      id: this.id,
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  getLatitude(unit = 'dd') {
    if (unit == 'dd') {
      return this.latitude.value;
    }
    /// IMPLEMENT DMS!
    return this.latitude.value;
  }

  getLongitude(unit = 'dd') {
    if (unit == 'dd') {
      return this.longitude.value;
    }
    /// IMPLEMENT DMS!
    return this.longitude.value;
  }

}
