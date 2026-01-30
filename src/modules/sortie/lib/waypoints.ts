import { LatLonMeasure } from './Routine';

export type WaypointData = {
    id: string;
    name: string;
    latitude: LatLonMeasure;
    longitude: LatLonMeasure;
}

const waypoints: { [keys: string]: WaypointData } = {
    "1": {
        "id": "PT1",
        "latitude": {
            "value": 52.666666666666664,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.16666666666666666,
            "unit": "decimal"
        },
        "name": "LOUTH"
    },
    "2": {
        "id": "PT2",
        "latitude": {
            "value": 52.86666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": 1.0,
            "unit": "decimal"
        },
        "name": "BLAKENEY POINT"
    },
    "3": {
        "id": "PT3",
        "latitude": {
            "value": 51.05,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.8833333333333333,
            "unit": "decimal"
        },
        "name": "WEYBOURNE"
    },
    "4": {
        "id": "PT4",
        "latitude": {
            "value": 51.333333333333336,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.95,
            "unit": "decimal"
        },
        "name": "EAST DEREHAM"
    },
    "5": {
        "id": "PT5",
        "latitude": {
            "value": 51.61666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.48333333333333334,
            "unit": "decimal"
        },
        "name": "DTY EAST"
    },
    "6": {
        "id": "PT6",
        "latitude": {
            "value": 50.03333333333333,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.21666666666666667,
            "unit": "decimal"
        },
        "name": "DTY WEST"
    },
    "7": {
        "id": "PT7",
        "latitude": {
            "value": 51.166666666666664,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.08333333333333337,
            "unit": "decimal"
        },
        "name": "NE. GREAT YARMOUTH"
    },
    "8": {
        "id": "PT8",
        "latitude": {
            "value": 51.916666666666664,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.21666666666666667,
            "unit": "decimal"
        },
        "name": "E. FELIXSTOWE"
    },
    "9": {
        "id": "PT9",
        "latitude": {
            "value": 50.81666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.25,
            "unit": "decimal"
        },
        "name": "E. DOVER"
    },
    "10": {
        "id": "PT10",
        "latitude": {
            "value": 49.46666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.5,
            "unit": "decimal"
        },
        "name": "S. BEXHILL"
    },
    "11": {
        "id": "PT11",
        "latitude": {
            "value": 49.333333333333336,
            "unit": "decimal"
        },
        "longitude": {
            "value": 1.0,
            "unit": "decimal"
        },
        "name": "E. BEMBRIDGE"
    },
    "12": {
        "id": "PT12",
        "latitude": {
            "value": 49.983333333333334,
            "unit": "decimal"
        },
        "longitude": {
            "value": 2.0,
            "unit": "decimal"
        },
        "name": "SE D023"
    },
    "13": {
        "id": "PT13",
        "latitude": {
            "value": 49.983333333333334,
            "unit": "decimal"
        },
        "longitude": {
            "value": 2.5833333333333335,
            "unit": "decimal"
        },
        "name": "S.START POINT"
    },
    "14": {
        "id": "PT14",
        "latitude": {
            "value": 51.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 3.1666666666666665,
            "unit": "decimal"
        },
        "name": "W. HARTLAND POINT"
    },
    "15": {
        "id": "PT15",
        "latitude": {
            "value": 49.783166666666666,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.683166666666667,
            "unit": "decimal"
        },
        "name": "CAMBORNE"
    },
    "16": {
        "id": "PT16",
        "latitude": {
            "value": 50.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 7.0,
            "unit": "decimal"
        },
        "name": "W. ISLES OF SCILLY"
    },
    "17": {
        "id": "PT17",
        "latitude": {
            "value": 51.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 7.0,
            "unit": "decimal"
        },
        "name": "SW APPROACHES"
    },
    "18": {
        "id": "PT18",
        "latitude": {
            "value": 51.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 6.0,
            "unit": "decimal"
        },
        "name": "SW APPROACHES"
    },
    "19": {
        "id": "PT19",
        "latitude": {
            "value": 50.666666666666664,
            "unit": "decimal"
        },
        "longitude": {
            "value": 5.0,
            "unit": "decimal"
        },
        "name": "S. MILFORD HAVEN"
    },
    "20": {
        "id": "PT20",
        "latitude": {
            "value": 50.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 6.0,
            "unit": "decimal"
        },
        "name": "SW. MILFORD HAVEN"
    },
    "21": {
        "id": "PT21",
        "latitude": {
            "value": 50.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.5,
            "unit": "decimal"
        },
        "name": "SW. MILFORD HAVEN"
    },
    "22": {
        "id": "PT22",
        "latitude": {
            "value": 51.85,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.583333333333333,
            "unit": "decimal"
        },
        "name": "W. STRUMBLE"
    },
    "23": {
        "id": "PT23",
        "latitude": {
            "value": 52.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.583333333333333,
            "unit": "decimal"
        },
        "name": "E.DUBLIN"
    },
    "24": {
        "id": "PT24",
        "latitude": {
            "value": 52.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.0,
            "unit": "decimal"
        },
        "name": "N. LLANDUDNO"
    },
    "25": {
        "id": "PT25",
        "latitude": {
            "value": 53.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.0,
            "unit": "decimal"
        },
        "name": "W.WHITEHAVEN"
    },
    "26": {
        "id": "PT26",
        "latitude": {
            "value": 53.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.75,
            "unit": "decimal"
        },
        "name": "SW MULL OF GALLOWAY"
    },
    "27": {
        "id": "PT27",
        "latitude": {
            "value": 54.7,
            "unit": "decimal"
        },
        "longitude": {
            "value": 4.1,
            "unit": "decimal"
        },
        "name": "MULL OF KINTYRE"
    },
    "28": {
        "id": "PT28",
        "latitude": {
            "value": 54.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 7.0,
            "unit": "decimal"
        },
        "name": "N.LONDONDERRY"
    },
    "29": {
        "id": "PT29",
        "latitude": {
            "value": 54.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 9.0,
            "unit": "decimal"
        },
        "name": "NW.DONEGAL"
    },
    "30": {
        "id": "PT30",
        "latitude": {
            "value": 55.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 9.0,
            "unit": "decimal"
        },
        "name": "W.TIREE"
    },
    "31": {
        "id": "PT31",
        "latitude": {
            "value": 55.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 7.0,
            "unit": "decimal"
        },
        "name": "W.TIREE"
    },
    "32": {
        "id": "PT32",
        "latitude": {
            "value": 56.583333333333336,
            "unit": "decimal"
        },
        "longitude": {
            "value": 7.0,
            "unit": "decimal"
        },
        "name": "THE MINCH"
    },
    "33": {
        "id": "PT33",
        "latitude": {
            "value": 57.3,
            "unit": "decimal"
        },
        "longitude": {
            "value": 5.0,
            "unit": "decimal"
        },
        "name": "N.CAPE WRATH"
    },
    "34": {
        "id": "PT34",
        "latitude": {
            "value": 58.96666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": 5.0,
            "unit": "decimal"
        },
        "name": "N.CAPE WRATH"
    },
    "35": {
        "id": "PT35",
        "latitude": {
            "value": 57.3,
            "unit": "decimal"
        },
        "longitude": {
            "value": 3.0,
            "unit": "decimal"
        },
        "name": "PENTLAND FIRTH"
    },
    "36": {
        "id": "PT36",
        "latitude": {
            "value": 58.583333333333336,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.33333333333333337,
            "unit": "decimal"
        },
        "name": "FAIR ISLE"
    },
    "37": {
        "id": "PT37",
        "latitude": {
            "value": 58.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.33333333333333337,
            "unit": "decimal"
        },
        "name": "NE FRASERBURGH"
    },
    "38": {
        "id": "PT38",
        "latitude": {
            "value": 56.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.33333333333333337,
            "unit": "decimal"
        },
        "name": "E. ST ABBS HEAD"
    },
    "39": {
        "id": "PT39",
        "latitude": {
            "value": 53.21666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": 1.0,
            "unit": "decimal"
        },
        "name": "E.SUNDERLAND"
    },
    "40": {
        "id": "PT40",
        "latitude": {
            "value": 53.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.5166666666666667,
            "unit": "decimal"
        },
        "name": "E.WHITBY"
    },
    "41": {
        "id": "PT41",
        "latitude": {
            "value": 53.5,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.0,
            "unit": "decimal"
        },
        "name": "E.WHITBY"
    },
    "42": {
        "id": "PT42",
        "latitude": {
            "value": 52.36666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.55,
            "unit": "decimal"
        },
        "name": "E.SPURN POINT"
    },
    "43": {
        "id": "PT43",
        "latitude": {
            "value": 56.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.0,
            "unit": "decimal"
        },
        "name": "BETWEEN D513 AND D613"
    },
    "44": {
        "id": "PT44",
        "latitude": {
            "value": 56.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 3.0,
            "unit": "decimal"
        },
        "name": "NORTH SEA EAST OF D513 AND D323"
    },
    "45": {
        "id": "PT45",
        "latitude": {
            "value": 55.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 3.0,
            "unit": "decimal"
        },
        "name": "NORTH SEA EAST OF D323"
    },
    "46": {
        "id": "PT46",
        "latitude": {
            "value": 55.0,
            "unit": "decimal"
        },
        "longitude": {
            "value": 2.0,
            "unit": "decimal"
        },
        "name": "NORTH SEA EAST OF D323"
    },
    "47": {
        "id": "PT47",
        "latitude": {
            "value": 50.855,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.5616666666666666,
            "unit": "decimal"
        },
        "name": "CHILBOLTON"
    },
    "48": {
        "id": "PT48",
        "latitude": {
            "value": 49.21666666666667,
            "unit": "decimal"
        },
        "longitude": {
            "value": 1.1666666666666665,
            "unit": "decimal"
        },
        "name": "CHILBOLTON WEST POINT"
    },
    "49": {
        "id": "PT49",
        "latitude": {
            "value": 49.18,
            "unit": "decimal"
        },
        "longitude": {
            "value": 1.44,
            "unit": "decimal"
        },
        "name": "WARDON HILL"
    },
    "BAPIS": {
        "id": "BAPIS",
        "latitude": {
            "value": 52.31,
            "unit": "decimal"
        },
        "longitude": {
            "value": -0.38,
            "unit": "decimal"
        },
        "name": "BAPIS"
    },
    "ECTG": {
        "id": "ECTG",
        "latitude": {
            "value": 52.07,
            "unit": "decimal"
        },
        "longitude": {
            "value": 0.63,
            "unit": "decimal"
        },
        "name": "Cranfield Airport"
    }
}

export default waypoints;
