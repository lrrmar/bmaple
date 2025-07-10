import * as ol from 'ol';
import BaseLayer from 'ol/layer/Base';
import { fromLonLat, transformExtent } from 'ol/proj';
import { getUid } from 'ol/util';

class OpenLayersMap {
  static #instance: OpenLayersMap;
  static #map: ol.Map;

  public static get instance(): OpenLayersMap {
    return OpenLayersMap.#instance;
  }

  public static get map(): ol.Map {
    if (!OpenLayersMap.#map) {
      const tempExtent = [-20.0, 42, 10, 65];
      const extentInLambert = transformExtent(
        tempExtent,
        'EPSG:4326',
        'force_nwr_projection',
      );
      const options = {
        view: new ol.View({
          //center: [-3.0, 54.0],
          extent: extentInLambert,
          zoom: 5,
          projection: 'force_nwr_projection',
        }),
        zIndex: 0,
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
      if (getUid(l) === ol_uid) {
        layer = l;
      }
    });
    return layer ? layer : undefined;
  }
}

export default OpenLayersMap;
