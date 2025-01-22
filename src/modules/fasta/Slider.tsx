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
import { isMissingDeclaration } from 'typescript';

const Slider = () => {

    // We display a fixed number of slots
    const nTimeslots = 19;

    // We default to the the latest observation slot
    const defaultSliderValue = 8;

    const slot_ms = 15 * 60 * 1000;  // duration of 1 timeslot in msecs
    
    const dispatch = useDispatch();
    const fastaHashes : HashTable[] = useSelector(selectHashTables);
    const fastaLatestTimeslot : number = useSelector(selectLatestTimeslot);

    const [sliderTimeslots, setSliderTimeslots] = useState<number[]>([]);
    const [selectedTimeslot, setSelectedTimeslot] = useState<number>();
    const [selectedTimeString , setSelectedTimeString] = useState('');
    const [timeZoneString, setTimeZoneString] = useState('');
    const [currentSliderValue, setCurrentSliderValue] = useState<number>(defaultSliderValue);
    const [userMessageCrr, setUserMessageCrr] = useState<string|undefined>();
    const [userMessageRdt, setUserMessageRdt] = useState<string|undefined>();
  
    const crrIsVisible = useSelector(selectCrrVisible);
    const rdtIsVisible = useSelector(selectRdtVisible);
  
    const [animate, setAnimate] = useState(false);
    const [pulse, setPulse] = useState(0);
    const [pulseInterval, setPulseInterval] = useState(1000);

    // Current date time in msecs, and first timeslot in msecs 
    const [currentTimeMsecs, setCurrentTimeMsecs] = useState<number>(Date.now());

    const [ticksDiv1Width, setTicksDiv1Width] = useState('10%');
    const [ticksDiv2Width, setTicksDiv2Width] = useState('10%');
    const [ticksDiv3Width, setTicksDiv3Width] = useState('80%');

    const [lblStartSpacerWidth, setLblStartSpacerWidth] = useState('');
    const [lblEndSpacerWidth, setLblEndSpacerWidth] = useState('');
    const [lblDblWidth, setLblDblWidth] = useState('');

    useEffect(() => {
        /* Initial selection / positioning
        */
        if (!fastaLatestTimeslot) {
            return
        };

        console.log("fastaLatestTimeslot:" + fastaLatestTimeslot);

        // Start the slider 2 hours (8 slots) previous of latest slot:
        const latestSlotMsecs = (new Date(fastaLatestTimeslot).getTime());        
        const firstMsecs = latestSlotMsecs - (8 * slot_ms);
        const timeslots = Array(nTimeslots).fill(0).map((_, i) => firstMsecs + (i * slot_ms));
        //console.log(timeslots);
        setSliderTimeslots(timeslots);
        setSelectedTimeslot(timeslots[defaultSliderValue]);
    }, [fastaLatestTimeslot]);


    // Handle changes to slider selection
    useEffect(() => {

        //console.log("Slider::useEffect(), [selectedTimeslot]");
        console.log("selectedTimeslot:" + selectedTimeslot);
            
        if (selectedTimeslot) {

            const dtSelected = new Date(selectedTimeslot);
            const strSelected = dateAsDisplayString(dtSelected);
            setSelectedTimeString(strSelected);

            console.log("setSelectedTimeslot:" + strSelected);

            setTimeZoneString(timezoneAsDisplayString(dtSelected));

            // Find the CRR hash with matching effective_ts
            const crrLayerHash = fastaHashes.find( (hash : HashTable) => {
                return hash.name === "crr"
                    && hash.effective_ts === selectedTimeslot;
            });
    
            if (crrLayerHash) {
                if (crrLayerHash.is_available) {
                    var url = fastaHashTableToUrl(crrLayerHash);
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
                    dispatch(updateSelectedRdtId(null));
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
            if (currentSliderValue >= 0 && currentSliderValue < (sliderTimeslots.length-1)) {
                newValue = currentSliderValue + 1;
            }
            setCurrentSliderValue(newValue);
            setSelectedTimeslot(sliderTimeslots[newValue]);
        }

        if (pulse % 60 === 0) {
            setCurrentTimeMsecs(Date.now());
        }
    }, [pulse]);

    useEffect(() => {

        if (!sliderTimeslots) { return; }

        const firstTimeslotMsecs = sliderTimeslots[0];
        const lastTimeslotMsecs = sliderTimeslots[nTimeslots-1];

        if (!firstTimeslotMsecs) { return; }
        if (!lastTimeslotMsecs) { return; }

        // We need to work out where to position the "now" label on the slider.
        // We do this by using 3 divs: 1 for the "now" label and 1 either side.

        const totalMsecs = lastTimeslotMsecs - firstTimeslotMsecs;

        const msecsFirstToNow = (currentTimeMsecs - firstTimeslotMsecs);
        const msecsNowToLast = (lastTimeslotMsecs - currentTimeMsecs);

        // div2 containing the "now" text will occupy width equivalent to 2 slots:
        const div1Msecs = msecsFirstToNow - slot_ms;
        const div3Msecs = msecsNowToLast - slot_ms;

        const div1Percent = Math.round((div1Msecs / totalMsecs) * 100);
        const div3Percent = Math.round((div3Msecs / totalMsecs) * 100);
        const div2Percent = 100 - div1Percent - div3Percent;
        
        setTicksDiv1Width(div1Percent + '%');
        setTicksDiv2Width(div2Percent + '%');
        setTicksDiv3Width(div3Percent + '%');        
    }, [sliderTimeslots, currentTimeMsecs]);

    useEffect(() => {

        // We have 19 slots, each time label spans 2 slots, we work in percentages
        const labelWidthPct = 1/19 * 100;

        const lblDblWidthPctRounded = Math.round(((labelWidthPct) + Number.EPSILON) * 100) / 100;

        setLblDblWidth(lblDblWidthPctRounded + '%');

}, []);

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
            <div className="slider-time-label">{selectedTimeString}</div>
            <div className="slider-timezone-label">{timeZoneString}</div>
            <div className="slider-controls">
                <button className="slider-play" onClick={() => {setAnimate(!animate);}}>
                        {animate ? '\u25A0' : '\u25B6'}</button>

                <div className="slider-container">
                    <div className='slider-ticks-above-labels'>
                        {sliderTimeslots.map((object, i) =>
                            <div className='slider-ticks-above-label-item'>
                                {timeAsDisplayString(new Date(object))}
                            </div>
                        )}
                    </div>

                    <div className='slider-ticks-above-marks'>
                    {sliderTimeslots.map((object, i) =>
                            (new Date(object).getMinutes() === 0) ?
                                <div className='slider-ticks-above-mark-item-bigger'>|</div>
                            :
                                <div className='slider-ticks-above-mark-item'>|</div>
                        )}
                    </div>

                    <ReactSlider
                        className="customSlider"
                        thumbClassName="customSlider-thumb"
                        trackClassName="customSlider-track"
                        withTracks
                        onChange={(value) => {
                            console.log("onChange value=" + value);
                            setCurrentSliderValue(value);
                            if (value >= 0  && value <= (sliderTimeslots.length)) {
                                setSelectedTimeslot(sliderTimeslots[value]);
                            }
                        }}
                        value={currentSliderValue}
                        //defaultValue={defaultSliderValue}
                        markClassName="customSlider-mark"
                        min={0}
                        max={nTimeslots-1} />

                    <div className="slider-ticks-below">
                        <div className='slider-ticks-below-item' style={{width: ticksDiv1Width}}></div>
                        <div className='slider-ticks-below-item' style={{width: ticksDiv2Width}}><div>now</div></div>
                        <div className='slider-ticks-below-item' style={{width: ticksDiv3Width}}></div>
                    </div>

                </div>
            </div>
        </div>

    </div>
  );
};

export default Slider;
