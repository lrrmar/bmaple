//@ts-nocheck
import routineRow from './routineRow';
import waypointRow from './waypointRow';

type Doc = {
  'w:document': {
    'w:body': {
      'w:tbl': [Row, Row];
    };
  };
};

export const addRoutines = (
  doc,
  routines: { description: string; duration: string; soFar: string }[],
): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  const rows = [tables[1]['w:tr'][1]['w:tc']['w:tbl'][0]['w:tr']];
  routines.forEach((args, i: number) => {
    rows.push(
      routineRow(`${i + 1}`, args.description, args.duration, args.soFar),
    );
  });
  tables[1]['w:tr'][1]['w:tc']['w:tbl'][0]['w:tr'] = rows;
};

export const addWaypoints = (
  doc,
  waypoints: { description: string; coords: string }[],
): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  const rows = [];
  waypoints.forEach((waypoint, i) => {
    rows.push(waypointRow(waypoint.description, waypoint.coords));
  });
  tables[0]['w:tr'][5]['w:tc']['w:tbl']['w:tr'] = rows;
};

export const addMissionScientist = (doc, name: string): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  tables[0]['w:tr'][1]['w:tc'][0]['w:p']['w:r']['w:t'] = {
    '#text': name,
    '@_xml:space': 'preserve',
  };
};
export const addAuthor = (doc, name: string): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  tables[0]['w:tr'][1]['w:tc'][1]['w:p']['w:r']['w:t'] = {
    '#text': name,
    '@_xml:space': 'preserve',
  };
};

export const addApprover = (doc, name: string): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  // SET MISSION SCIENTIST
  tables[0]['w:tr'][1]['w:tc'][2]['w:p']['w:r']['w:t'] = {
    '#text': name,
    '@_xml:space': 'preserve',
  };
};

export const addScientificAims = (doc, aims: string): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  // SET SCIENTIFIC AIMS
  tables[0]['w:tr'][3]['w:tc']['w:p']['w:r']['w:t'] = {
    '#text': aims,
    '@_xml:space': 'preserve',
  };
};

const _addInfo = (doc, i: number, j: number, info: string): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  tables[0]['w:tr'][j]['w:tc'][i]['w:p']['w:r'] = [
    {
      'w:rPr': {
        'w:rFonts': {
          '@_w:ascii': 'Tahoma',
          '@_w:cs': 'Tahoma',
          '@_w:eastAsia': 'Tahoma',
          '@_w:hAnsi': 'Tahoma',
        },
        'w:b': { '@_w:val': '1' },
        'w:bCs': { '@_w:val': '1' },
        'w:color': { '@_w:val': '000000' },
        'w:sz': { '@_w:val': '18' },
        'w:szCs': { '@_w:val': '18' },
        'w:vertAlign': { '@_w:val': 'baseline' },
        'w:rtl': { '@_w:val': '0' },
      },
      'w:t': { '#text': info, '@_xml:space': 'preserve' },
      '@_w:rsidDel': '00000000',
      '@_w:rsidR': '00000000',
      '@_w:rsidRPr': '00000000',
    },
    {
      'w:rPr': { 'w:rtl': { '@_w:val': '0' } },
      '@_w:rsidDel': '00000000',
      '@_w:rsidR': '00000000',
      '@_w:rsidRPr': '00000000',
    },
  ];
};

export const addPlannedTOTime = (doc, time: string): void => {
  _addInfo(doc, 1, 6, time);
};

export const addDepartureAirport = (doc, name: string): void => {
  _addInfo(doc, 3, 6, name);
};

export const addLandingAirport = (doc, name: string): void => {
  _addInfo(doc, 3, 7, name);
};

export const addFIRSZones = (doc, info: string): void => {
  _addInfo(doc, 5, 6, info);
};

export const addSondes = (doc, info: string): void => {
  _addInfo(doc, 5, 7, info);
};

const _addInfoB = (doc, j: number, info: string): void => {
  const tables = doc['w:document']['w:body']['w:tbl'];
  tables[0]['w:tr'][j]['w:tc']['w:p']['w:r'] = {
    'w:rPr': {
      'w:rFonts': {
        '@_w:ascii': 'Tahoma',
        '@_w:cs': 'Tahoma',
        '@_w:eastAsia': 'Tahoma',
        '@_w:hAnsi': 'Tahoma',
      },
      'w:b': { '@_w:val': '1' },
      'w:bCs': { '@_w:val': '1' },
      'w:sz': { '@_w:val': '18' },
      'w:szCs': { '@_w:val': '18' },
      'w:vertAlign': { '@_w:val': 'baseline' },
      'w:rtl': { '@_w:val': '0' },
    },
    'w:t': { '#text': info, '@_xml:space': 'preserve' },
    '@_w:rsidDel': '00000000',
    '@_w:rsidR': '00000000',
    '@_w:rsidRPr': '00000000',
  };
};

export const addWeatherNoGo = (doc, info: string) => {
  _addInfoB(doc, 9, info);
};

export const addInstrumentServicability = (doc, info: string) => {
  _addInfoB(doc, 11, info);
};

export const addSpecialNotes = (doc, info: string) => {
  _addInfoB(doc, 13, info);
};
