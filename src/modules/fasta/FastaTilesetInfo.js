import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  createContext,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateFastaHashesFlag, selectFastaBaseUrl } from '../mapSlice';

const FastaTilesetInfoContext = createContext();

const FastaTilesetInfoServer = () => {
  //    const dispatch = useDispatch();
  //    const fastaBaseUrl = useSelector(selectFastaBaseUrl);
  //    const [variables, setVariables] = useState([])
  //    const variablesRef = useRef([]);
  //    const [hashTables, setTilesetInfo] = useState([]);
  //    const [exportTilesetInfo, setExportTilesetInfo] = useState([]);
  //    const [initRender, setInitRender] = useState(true);
  //    const [tilesetCrr, setTilesetCrr] = useState([]);
  //    const [tilesetRdt, setTilesetRdt] = useState([]);
  //    const [latestCrrTimeslot, setLatestCrrTimeslot] = useState(null);
  //    const [latestRdtTimeslot, setLatestRdtTimeslot] = useState(null);
  //
  //
  //    const updateLayers = (tilesetCrr, tilesetRdt) => {
  //
  //        var latestCrrObservation = {};
  //        var crrObservations = [];
  //
  //        var latestRdtObservation = {};
  //        var rdtObservations = [];
  //
  //        var newCrrDataAvailable = false;
  //        var newRdtDataAvailable = false;
  //
  //
  //        if (latestCrrTimeslot == null
  //            || tilesetCrr.latest_timeslot > latestCrrTimeslot
  //            || tilesetCrr.timeslots[0].forecast_slots.length > latestCrrForecastSlots) {
  //
  //            newCrrDataAvailable = true;
  //            tempAlert("Refreshing data ...", 2000);
  //        }
  //
  //
  //        if (latestRdtTimeslot == null
  //            || tilesetRdt.latest_timeslot > latestRdtTimeslot) {
  //
  //            newRdtDataAvailable = true;
  //        }
  //
  //        if (newCrrDataAvailable == true) {
  //
  //            latestCrrTimeslot = tilesetCrr.latest_timeslot;
  //            latestCrrForecastSlots = tilesetCrr.timeslots[0].forecast_slots.length;
  //
  //            removeCrrLayers(crrTimeslots);
  //            setTimeRangeLabels(tilesetCrr.latest_timeslot);
  //
  //            latestCrrObservation = tilesetCrr.timeslots[0];
  //            crrObservations = tilesetCrr.timeslots.slice(0,9);
  //        }
  //
  //        if (newRdtDataAvailable == true) {
  //
  //            latestRdtTimeslot = tilesetRdt.latest_timeslot;
  //            latestRdtForecastSlots = 0;
  //
  //            removeRdtLayers(rdtTimeslots);
  //
  //            latestRdtObservation = tilesetRdt.timeslots[0];
  //            rdtObservations = tilesetRdt.timeslots.slice(0,9);
  //        }
  //
  //        if (newCrrDataAvailable) {
  //            // Store obtained timeslots in an array
  //            crrTimeslots = [];
  //            crrObservations.reverse();
  //            for (var i = 0; i < crrObservations.length; i++) {
  //                var uri = crrObservations[i].uri + "/{z}/{x}/{y}.pbf?token=" + fasta_api_access_token;
  //                var dt = new Date(crrObservations[i].timeslot);
  //                var slot = {
  //                    "uri": uri,
  //                    "slot": dt,
  //                    "available": crrObservations[i].available,
  //                    "type": "o",
  //                    "offset": 0
  //                };
  //                if (crrObservations[i].missing_data_features != null
  //                    && crrObservations[i].missing_data_features.length > 0) {
  //                    slot["missing_data"] = true;
  //                }
  //                else {
  //                    slot["missing_data"] = false;
  //                }
  //                crrTimeslots.push(slot);
  //            }
  //        }
  //
  //        if (newRdtDataAvailable) {
  //            //Store obtained timeslots in an array
  //            rdtTimeslots = [];
  //            rdtObservations.reverse();
  //            for (var i = 0; i < rdtObservations.length; i++) {
  //                var uri = rdtObservations[i].uri + "/{z}/{x}/{y}.pbf?token=" + fasta_api_access_token;
  //                var dt = new Date(rdtObservations[i].timeslot);
  //                var slot = {
  //                    "uri": uri,
  //                    "slot": dt,
  //                    "available": rdtObservations[i].available,
  //                    "type": "o",
  //                    "offset": 0,
  //                    "completeness": rdtObservations[i].product_completeness
  //                };
  //                rdtTimeslots.push(slot);
  //            }
  //        }
  //
  //        if (newCrrDataAvailable == true) {
  //
  //            //Now add forecast slots up to 2 hours
  //            var dtLatestObs = new Date(latestCrrObservation.timeslot);
  //            console.log("dt:" + dtLatestObs);
  //            var uriFragment = latestCrrObservation.uri + "/{z}/{x}/{y}.pbf?token=" + fasta_api_access_token;
  //            for (var i = 0; i < 8; i++) {
  //                var offset = (i+1) * TS_DURATION_MINS;
  //                var uri = uriFragment + "&forecast=" + offset;
  //                var dt = new Date(dtLatestObs.getTime() + (offset * MS_PER_MINUTE));
  //                var slot = {};
  //                if (latestCrrObservation.forecast_slots.includes(offset)) {
  //                    slot = { "uri": uri, "slot": dt, "available": "yes", "type": "f", "offset": offset };
  //                }
  //                else {
  //                    slot = { "uri": uri, "slot": dt, "available": "no", "type": "f", "offset": offset };
  //                }
  //                crrTimeslots.push(slot);
  //            }
  //        }
  //
  //        if (newCrrDataAvailable == true) {
  //            //Add layers for each timeslot to the map
  //            addCrrLayers(map, crrTimeslots);
  //            currentTimeslotIdx = 0;
  //            if (crr) {
  //                showHideCrrLayer(crrTimeslots[0], 0);
  //            }
  //        }
  //
  //        if (newRdtDataAvailable == true) {
  //            addRdtLayers(map, rdtTimeslots);
  //            currentTimeslotIdx = 0;
  //            if (rdt) {
  //                showHideRdtLayer(rdtTimeslots[0], 0);
  //            }
  //        }
  //
  //
  //        updateTimeRange();
  //
  //        if (newCrrDataAvailable || newRdtDataAvailable) {
  //            var strNow = timeString(new Date());
  //            document.getElementById("last-updated").innerHTML = "Data last updated: " + strNow;
  //        }
  //
  //        loopsDone = 0;
  //        play(true);
  //    }
  //
  //    const getFastaTilesetInfo = () => {
  //        var fastaHashes = sessionStorage.getItem('fastaHashes');
  //        if (fastaHashes == null) {
  //            sessionStorage.setItem('fastaHashes', JSON.stringify([]));
  //            fastaHashes = sessionStorage.getItem('fastaHashes');
  //        } else {
  //        };
  //        return JSON.parse(fastaHashes);
  //    }
  //
  //    const appendFastaHash = (val) => {
  //        const fastaHashes = getFastaTilesetInfo();
  //        fastaHashes.push(val);
  //        sessionStorage.setItem('fastaHashes', JSON.stringify(fastaHashes));
  //        const updatedFastaHashes = JSON.stringify(sessionStorage.getItem('fastaHashes'));
  //        setFastaHashes(updatedFastaHashes);
  //
  //    }
  //
  //    const appendFastaHashes = (vals) => {
  //        const fastaHashes = getFastaTilesetInfo();
  //        const concatFastaHashes = fastaHashes.concat(vals);
  //        const uniqueFastaHashes = fastaHashes.filter((item, index, self) =>
  //            index === self.findIndex((t) => (
  //                t.id === item.id
  //            ))
  //        );
  //        sessionStorage.setItem('fastaHashes', JSON.stringify(concatFastaHashes));
  //        const updatedFastaHashes = sessionStorage.getItem('fastaHashes');
  //        setFastaHashes(updatedFastaHashes);
  //        dispatch(updateFastaHashesFlag());
  //    }
  //
  //    const [fastaHashes, setFastaHashes] = useState(getFastaTilesetInfo);
  //
  //    //const memoizedVariables = useMemo(() => ({
  //    //    variables,
  //    //}), [variables]);
  //
  //    const fetchFastaTilesetInfo = async () => {
  //        const productCodes = {
  //            'Convective Rainfall Rate': 'crr',
  //            'Rapidly Developing Thunderstorms': 'rdt',
  //        };
  //        const response = await fetch(`https://${fastaBaseUrl}/api/v1/vts/?token=1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0`);
  //        const json = await response.json();
  //        console.log(json);
  //        json.tilesets.forEach((tileset) => {
  //            if (tileset.code === 'CRR') {setTilesetCrr(tileset)}
  //            else if(tileset.code === 'RDT') {setTilesetRdt(tileset)}
  //        })
  //    }
  //
  //    //useEffect(() => {
  //    //    var newVariables = variables.filter(item =>
  //    //        !variablesRef.current.includes(item));
  //    //    newVariables.map((variable) => fetchVariableHashes(variable));;
  //    //}, [memoizedVariables]);
  //    //
  //    useEffect(() => {
  //        fetchFastaTilesetInfo();
  //    }, []);
  //
  //    useEffect(() => {
  //        console.log(tilesetCrr);
  //        console.log(tilesetRdt);
  //    }, [tilesetCrr, tilesetRdt])
  //
  //    //    return fastaHashes;
};

const useFastaTilesetInfo = () => {
  const fastaHashes = sessionStorage.getItem('fastaHashes');
  return fastaHashes == null ? [] : JSON.parse(fastaHashes);
};

export default FastaTilesetInfoServer;
export { FastaTilesetInfoContext, useFastaTilesetInfo };
