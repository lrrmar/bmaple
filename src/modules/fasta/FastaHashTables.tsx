import {
  useRef,
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectBaseUrl,
  updateHashTables,
  updateLatestTimeslot,
} from './fastaSlice';

export interface HashTable {
  [key: string]: string | number;
  name: string; // product
  timeslot: number; // unix timestamp
  forecast_slot: string;
  effective_ts: number;
}


const FastaHashTablesServer = () => {
  const dispatch = useDispatch();
  const fastaBaseUrl = useSelector(selectBaseUrl);
  const [hashTablesToKeep, setHashTablesToKeep] = useState<HashTable[]>([]);
  const [latestTimeslot, setLatestTimeslot] = useState<string|null>(null);

  const getFastaHashTables = () => {
    var fastaHashes = sessionStorage.getItem('fastaHashes');
    if (fastaHashes == null) {
      sessionStorage.setItem('fastaHashes', JSON.stringify([]));
      return JSON.parse(JSON.stringify([]));
    } else {
      return JSON.parse(fastaHashes);
    }
  };

  const appendFastaHash = (val : HashTable) => {
    const fastaHashes = getFastaHashTables();
    fastaHashes.push(val);
    sessionStorage.setItem('fastaHashes', JSON.stringify(fastaHashes));
    const updatedFastaHashes = JSON.stringify(
      sessionStorage.getItem('fastaHashes'),
    );
    setFastaHashes(updatedFastaHashes);
  };

  const appendFastaHashes = (vals : HashTable[]) => {
    const fastaHashes = getFastaHashTables();
    const concatFastaHashes = fastaHashes.concat(vals);
    const uniqueFastaHashes = fastaHashes.filter(
      (item:HashTable, index:number, self:HashTable[]) =>
        index === self.findIndex((t:HashTable) => t.id === item.id),
    );
    sessionStorage.setItem('fastaHashes', JSON.stringify(concatFastaHashes));
    const updatedFastaHashes = sessionStorage.getItem('fastaHashes');
    setFastaHashes(updatedFastaHashes);
  };

  const filterFastaHashes = (hashes : HashTable[], product : string) => {
    // Filter out forecast hashes leaving just observations,
    // and sort so that latest observation is first
    const observationHashes = hashes
      .filter((hash) => {
        return hash.forecast_slot === '' && hash.name === product;
      })
      .sort((a, b) =>
        a.timeslot < b.timeslot ? 1 : b.timeslot < a.timeslot ? -1 : 0,
      );

    const latest = observationHashes[0];

    // Filter forecast hashes, keeping only the CRR forecasts for the latest observation
    // (upto 10 forecasts per timeslot currently returned by API, i.e. 2.5 hours).
    const forecastHashes = hashes
      .filter((hash) => {
        return (
          hash.timeslot === latest.timeslot &&
          hash.name === product && product === 'crr' &&
          hash.forecast_slot !== ''
        );
      })
      .sort((a, b) => Number(a.forecast_slot) - Number(b.forecast_slot));

    // Keep the most recent observation slots (at most 9, i.e. 2 hours)
    // and the latest forecast slots (at most 10) in an array
    return observationHashes
      .slice(0, Math.min(observationHashes.length, 9))
      .reverse()
      .concat(forecastHashes);
  };

  // Dispatch HashTablesToKeep to Redux state
  useEffect(() => {
    console.log(hashTablesToKeep);
    dispatch(updateHashTables(hashTablesToKeep));
  }, [hashTablesToKeep]);

  // Dispatch latestTimeslot to Redux state
  useEffect(() => {
    console.log(latestTimeslot);
    dispatch(updateLatestTimeslot(latestTimeslot));
  }, [latestTimeslot]);

  const [fastaHashes, setFastaHashes] = useState(getFastaHashTables);

  const fetchFastaHashes = async () => {

    const productCodes : { [index: string] : string } = {
      'Convective Rainfall Rate': 'crr',
      'Rapidly Developing Thunderstorms': 'rdt',
    };

    const response = await fetch(
      `https://${fastaBaseUrl}/api/v1/vts/?token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0`,
    );
    const json = await response.json();

    var latestTs : string = '';
    var hashes : HashTable[] = [];

    json.tilesets.forEach((product: any) => {

      const name = productCodes[product.name];
      if (name === 'crr') {
        // The UI will need to know latest available timeslot to calibrate selector controls.
        // CRR and RDT may differ but CRR takes priority.
        latestTs = product.latest_timeslot;
      }
      product.timeslots.forEach((timeslot: any) => {
        const timestamp = new Date(timeslot.timeslot).getTime();
        const isLatest = timeslot.timeslot === product.latest_timeslot;
        const hash : HashTable = {
          name: name,
          timeslot: timestamp, // new Date(timestamp).toISOString(), //timeslot.timeslot,
          forecast_slot: '',
          effective_ts: timestamp,
        };
        //console.log("Adding hash:" + timestamp);
        hashes.push(hash);

        timeslot.forecast_slots.forEach((forecast_slot : number) => {
          //console.log("Adding forecast hash:" + timestamp + ": " + forecast_slot.toString());
          const forecast_hash = { ...hash };
          forecast_hash.forecast_slot = forecast_slot.toString();
          forecast_hash.effective_ts = timestamp + forecast_slot * 60 * 1000;
          hashes.push(forecast_hash);
        });
      });
    });
    appendFastaHashes(hashes);

    const keepers = filterFastaHashes(hashes, 'crr').concat(
      filterFastaHashes(hashes, 'rdt'),
    );

    setHashTablesToKeep(keepers);
    console.log('keepers:');
    console.log(keepers);

    setLatestTimeslot(latestTs);
  };

  useEffect(() => {
    fetchFastaHashes();
  }, []);

  return <div className='FastaHashTables'></div>;
};

export default FastaHashTablesServer;
