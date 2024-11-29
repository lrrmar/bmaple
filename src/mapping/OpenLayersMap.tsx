import * as ol from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { get, fromLonLat, ProjectionLike } from 'ol/proj';

class OpenLayersMap {
  static #instance: OpenLayersMap;
  static #map: ol.Map;

  //private constructor() {}

  public static get instance(): OpenLayersMap {
    return OpenLayersMap.#instance;
  }

  public static get map(): ol.Map {
    if (!OpenLayersMap.#map) {
      const options = {
        view: new ol.View({
          center: fromLonLat([-3.0, 54.0]),
          zoom: 5,
          projection: 'EPSG:3857',
        }),
      };

      OpenLayersMap.#map = new ol.Map(options);
      OpenLayersMap.#map.updateSize();
    }
    return OpenLayersMap.#map;
  }

  public getLayerByUid(ol_uid: string) {
    let layer;
    OpenLayersMap.#map.getLayers().forEach((l: any) => {
      if (l.ol_uid === ol_uid) {
        layer = l;
      }
    });
    return layer;
  }
}

//const openLayersMap = new OpenLayersMap();
//Object.freeze(openLayersMap);

export default OpenLayersMap;
