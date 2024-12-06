import * as ol from 'ol';
import BaseLayer from 'ol/layer/Base';
import { fromLonLat } from 'ol/proj';

class OpenLayersMap {
  static #instance: OpenLayersMap;
  static #map: ol.Map;

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
        controls: [],
      };

      OpenLayersMap.#map = new ol.Map(options);
      OpenLayersMap.#map.updateSize();
    }
    return OpenLayersMap.#map;
  }

  public getLayerByUid(ol_uid: string) {
    let layer: BaseLayer | undefined = undefined;
    OpenLayersMap.#map.getLayers().forEach((l: BaseLayer): void => {
      if (l.getProperties()['ol_uid'] === ol_uid) {
        layer = l;
      }
    });
    return layer ? layer : undefined;
  }
}

export default OpenLayersMap;
