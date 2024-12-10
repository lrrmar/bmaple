import React, {
    useEffect,
    useState,
    //useRef,
} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import ReactSlider from "react-slider";
import './Slider.css';
import { useFastaHashTables } from './FastaHashTables';
import {
    selectFastaHashesFlag,
    //updateSelectedFastaCrrLayer,
    //updateSelectedFastaRdtLayer,
} from '../../mapping/mapSlice';
import {
    selectBaseUrl,
    selectSelectedCrrId,
    selectSelectedRdtId,
    selectHashTables,
    selectLatestTimeslot,
    updateProfileCrrId,
    updateProfileRdtId,
    updateSelectedCrrId,
    updateSelectedRdtId,
    /*
    selectFastaHashesFlag,
    selectFastaHashTables,
    selectFastaLatestTimeslot,
    updateSelectedFastaCrrLayer,
    updateSelectedFastaRdtLayer,
    */
} from './fastaSlice';
import {
    dateAsUrlParamString,
    dateAsDisplayString,
} from './dateFormatHelpers';
import fastaHashTableToUrl from  './fastaHashTableToUrl';
import { current } from '@reduxjs/toolkit';


const Slider = () => {

    const dispatch = useDispatch();
    const fastaHashes = useSelector(selectHashTables);
    const fastaLatestTimeslot = useSelector(selectLatestTimeslot);

    //const [availableProducts, setAvailableProducts] = useState([]);

    const [sliderTimeslots, setSliderTimeslots] = useState([]);
    const [selectedTimeslot, setSelectedTimeslot] = useState();
    const [product , setProduct] = useState('');
    const [currentTimeString , setCurrentTimeString] = useState('');

    // We display a fixed number of slots
    const nTimeslots = 19;

    // We default to the the latest observation slot
    const defaultSliderValue = 8;

    useEffect(() => {
        
        if (fastaHashes.length === 0) {
            return
        };

        console.log("fastaHashes:");
        console.log(fastaHashes);

        //setProduct("crr");
        
        // If you uncomment the next line you will be able to see RDT polygons on the map with a black fill.
        //setProduct("rdt");

        setSelectedTimeslot(sliderTimeslots[defaultSliderValue]);
    }, [fastaHashes]);


    useEffect(() => {
        /* Initial selection / positioning
        */

        console.log("Slider::useEffect(), [fastaLatestTimeslot]");

        if (!fastaLatestTimeslot) {
            return
        };

        console.log("fastaLatestTimeslot:" + fastaLatestTimeslot);

        // Start the slider 2 hours (8 slots) previous of latest slot:
        const slot_ms = 15 * 60 * 1000;  // duration of 1 timeslot in msecs
        const firstTs = new Date(fastaLatestTimeslot).getTime() - (8 * slot_ms);
        const timeslots = Array(nTimeslots).fill(0).map((_, i) => firstTs + (i * slot_ms));

        //console.log(timeslots);
        setSliderTimeslots(timeslots);
    }, [fastaLatestTimeslot]);


    // Handle changes to slider selection
    useEffect(() => {

        console.log("Slider::useEffect(), [selectedTimeslot]");
    
        if (selectedTimeslot) {

            const strTs = new Date(selectedTimeslot).toISOString();
            console.log("selectedTs:" + strTs);

            // Find the CRR/RDT hash with matching effective_ts
            const crrLayerHash = fastaHashes.find(hash => {
                return hash.name === "crr"
                    && hash.effective_ts === selectedTimeslot;
            });
    
            if (crrLayerHash) {
                var url = fastaHashTableToUrl(crrLayerHash);
                console.log(url);
                const newCrrLayerHash = {apiRequest: url};

                dispatch(updateSelectedCrrId(newCrrLayerHash.apiRequest));                
                setCurrentTimeString(dateAsDisplayString(new Date(crrLayerHash.effective_ts)));
            } else {
                dispatch(updateSelectedCrrId(null));
            }

            // Find the CRR/RDT hash with matching effective_ts
            const rdtLayerHash = fastaHashes.find(hash => {
                return hash.name === "rdt"
                        && hash.effective_ts === selectedTimeslot;
            });
                
            if (rdtLayerHash) {
                var url = fastaHashTableToUrl(rdtLayerHash);
                console.log(url);
                const newRdtLayerHash = {apiRequest: url};

                // RDT support: do this update for both CRR and RDT
                dispatch(updateSelectedRdtId(newRdtLayerHash.apiRequest));
                
                setCurrentTimeString(dateAsDisplayString(new Date(rdtLayerHash.effective_ts)));
            } else {
                dispatch(updateSelectedRdtId(null));
            }
            
        }

    }, [selectedTimeslot, fastaHashes]);

    //const Track = (props, state) => <div {...props} key={state.key} index={state.index}></div>;
    //const Thumb = (props, state) => <div {...props} key={state.key}></div>;;

    //renderTrack={Track}
    //renderThumb={Thumb}

    return (
    <div>
    <div className="slider-time-label">{currentTimeString}</div>
    <ReactSlider
        className="customSlider"
        thumbClassName="customSlider-thumb"
        trackClassName="customSlider-track"
        withTracks
        onChange={(value) => {
            console.log("onChange value=" + value);
            if (value >= 0  && value < sliderTimeslots.length) {
                setSelectedTimeslot(sliderTimeslots[value]);
            }
        }}
        defaultValue={defaultSliderValue}
        markClassName="customSlider-mark"
        marks={1}
        min={0}
        max={nTimeslots-1} />
    </div>
  );
};

export default Slider;
