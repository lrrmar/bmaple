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
    selectCrrVisible,
    selectRdtVisible,
} from './fastaSlice';
import type { HashTable } from './FastaHashTables';
import {
    dateAsDisplayString,
    timeAsDisplayString,
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
    const [userMessageCrr, setUserMessageCrr] = useState<string|undefined>();
    const [userMessageRdt, setUserMessageRdt] = useState<string|undefined>();
  
    const crrIsVisible = useSelector(selectCrrVisible);
    const rdtIsVisible = useSelector(selectRdtVisible);
  
    const [animate, setAnimate] = useState(false);
    const [pulse, setPulse] = useState(0);
    const [pulseInterval, setPulseInterval] = useState(1000);

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
        setSelectedTimeslot(timeslots[defaultSliderValue]);
    
    }, [fastaLatestTimeslot]);


    // Handle changes to slider selection
    useEffect(() => {

        console.log("Slider::useEffect(), [selectedTimeslot]");
        console.log("selectedTimeslot:" + selectedTimeslot);
            
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
                if (crrLayerHash.is_available) {
                    var url = fastaHashTableToUrl(crrLayerHash);
                    console.log(url);
                    const newCrrLayerHash = {apiRequest: url};
                    setUserMessageCrr(undefined);
                    dispatch(updateSelectedCrrId(newCrrLayerHash.apiRequest));
                }
                else {
                    setUserMessageCrr("CRR: data not available for "
                        + timeAsDisplayString(new Date(crrLayerHash.effective_ts))
                        + " slot");
                    dispatch(updateSelectedCrrId(null));    
                }
            } else {
                setUserMessageCrr("CRR: data not available");
                dispatch(updateSelectedCrrId(null));
            }

            // Find the RDT hash with matching effective_ts
            const rdtLayerHash = fastaHashes.find( (hash : HashTable) => {
                return hash.name === "rdt"
                        && hash.effective_ts === selectedTimeslot;
            });

            if (rdtLayerHash) {
                if (rdtLayerHash.is_available) {
                    var url = fastaHashTableToUrl(rdtLayerHash);
                    console.log(url);
                    const newRdtLayerHash = {apiRequest: url};
                    dispatch(updateSelectedRdtId(newRdtLayerHash.apiRequest));

                    if (rdtLayerHash.completeness && rdtLayerHash.completeness < 92) {
                        setUserMessageRdt("RDT: data incomplete "
                            + rdtLayerHash.completeness + "% for "
                            + timeAsDisplayString(new Date(rdtLayerHash.effective_ts))
                            + " slot");
                    } else {
                        setUserMessageRdt(undefined);
                    }
                }
                else {
                    setUserMessageRdt("RDT: data not available for "
                        + timeAsDisplayString(new Date(rdtLayerHash.effective_ts)) + " slot");
                }
            } else {
                // No forecasts for RDT
                if (selectedTimeslot > fastaLatestTimeslot) {
                    setUserMessageRdt("RDT: data not available");
                }
                else {
                    setUserMessageRdt("RDT: forecasts are not displayed for RDT");
                }
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
        }
    }, [pulse]);


    //const Track = (props, state) => <div {...props} key={state.key} index={state.index}></div>;
    //const Thumb = (props, state) => <div {...props} key={state.key}></div>;;
    //renderTrack={Track}
    //renderThumb={Thumb}

    return (
    <div>
        <div className="slider-message">
            {crrIsVisible && userMessageCrr && <div className="slider-message-label">{userMessageCrr}</div>}
            {rdtIsVisible && userMessageRdt && <div className="slider-message-label">{userMessageRdt}</div>}
        </div>
        <div className="slider">
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
                //defaultValue={defaultSliderValue}
                markClassName="customSlider-mark"
                marks={1}
                min={0}
                max={nTimeslots-1} />
            </div>
        </div>
    </div>
  );
};

export default Slider;
