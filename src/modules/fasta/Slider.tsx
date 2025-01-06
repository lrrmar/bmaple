import React, {
    useEffect,
    useState,
} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import ReactSlider from "react-slider";
import './Slider.css';
import {
    selectHashTables,
    selectLatestTimeslot,
    updateSelectedCrrId,
    updateSelectedRdtId,
} from './fastaSlice';
import type { HashTable } from './FastaHashTables';
import {
    dateAsDisplayString,
    timezoneAsDisplayString,
} from './dateFormatHelpers';
import fastaHashTableToUrl from  './fastaHashTableToUrl';

const Slider = () => {

    // We display a fixed number of slots
    const nTimeslots = 19;

    // We default to the the latest observation slot
    const defaultSliderValue = 8;
    
    const dispatch = useDispatch();
    const fastaHashes : HashTable[] = useSelector(selectHashTables);
    const fastaLatestTimeslot : number = useSelector(selectLatestTimeslot);
    const [sliderTimeslots, setSliderTimeslots] = useState<number[]>([]);
    const [selectedTimeslot, setSelectedTimeslot] = useState<number>();
    const [currentTimeString , setCurrentTimeString] = useState('');
    const [timeZoneString, setTimeZoneString] = useState('');
    const [currentSliderValue, setCurrentSliderValue] = useState<number>(defaultSliderValue);

    const [animate, setAnimate] = useState(false);
    const [pulse, setPulse] = useState(0);
    const [pulseInterval, setPulseInterval] = useState(1000);
  
    useEffect(() => {
        if (fastaHashes.length === 0) {
            return
        };
        console.log("fastaHashes:");
        console.log(fastaHashes);

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

            const dtSelected = new Date(selectedTimeslot);
            setCurrentTimeString(dateAsDisplayString(dtSelected));
            setTimeZoneString(timezoneAsDisplayString(dtSelected));

            // Find the CRR hash with matching effective_ts
            const crrLayerHash = fastaHashes.find( (hash : HashTable) => {
                return hash.name === "crr"
                    && hash.effective_ts === selectedTimeslot;
            });
    
            if (crrLayerHash) {
                var url = fastaHashTableToUrl(crrLayerHash);
                console.log(url);
                const newCrrLayerHash = {apiRequest: url};
                dispatch(updateSelectedCrrId(newCrrLayerHash.apiRequest));
            } else {
                dispatch(updateSelectedCrrId(null));
            }

            // Find the RDT hash with matching effective_ts
            const rdtLayerHash = fastaHashes.find( (hash : HashTable) => {
                return hash.name === "rdt"
                        && hash.effective_ts === selectedTimeslot;
            });
                
            if (rdtLayerHash) {
                var url = fastaHashTableToUrl(rdtLayerHash);
                console.log(url);
                const newRdtLayerHash = {apiRequest: url};
                dispatch(updateSelectedRdtId(newRdtLayerHash.apiRequest));
            } else {
                dispatch(updateSelectedRdtId(null));
            }   
        }
    }, [selectedTimeslot, fastaHashes]);

    useEffect(() => {
        const doPulse = () => setPulse((currentPulse) => currentPulse + 1);
        const interval = setInterval(doPulse, pulseInterval);
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        if (animate) {
            var newValue : number = 0;
            if (currentSliderValue >= 0 && currentSliderValue < sliderTimeslots.length) {
                newValue = currentSliderValue + 1;
            }
            setCurrentSliderValue(newValue);
            setSelectedTimeslot(sliderTimeslots[newValue]);
            console.log(" new idx:" + newValue);            
        }
    }, [pulse]);

    //const Track = (props, state) => <div {...props} key={state.key} index={state.index}></div>;
    //const Thumb = (props, state) => <div {...props} key={state.key}></div>;;
    //renderTrack={Track}
    //renderThumb={Thumb}

    return (
    <div>
    <div className="slider-time-label">{currentTimeString}</div>
    <div className="slider-timezone-label">{timeZoneString}</div>
    <div className="slider-controls">
    <button className="slider-play" onClick={() => {setAnimate(!animate);}}>
            {animate ? '\u25A0' : '\u25B6'}</button>
    <ReactSlider
        className="customSlider"
        thumbClassName="customSlider-thumb"
        trackClassName="customSlider-track"
        withTracks
        onChange={(value) => {
            console.log("onChange value=" + value);
            setCurrentSliderValue(value);
            if (value >= 0  && value < sliderTimeslots.length) {
                setSelectedTimeslot(sliderTimeslots[value]);
            }
        }}
        value={currentSliderValue}
        defaultValue={defaultSliderValue}
        markClassName="customSlider-mark"
        marks={1}
        min={0}
        max={nTimeslots-1} />
    </div>
    </div>
  );
};

export default Slider;
