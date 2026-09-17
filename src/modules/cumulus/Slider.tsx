import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactSlider from 'react-slider';
import './Slider.css';
import {
  //selectHashTables,
  updateSelectedEntry,
} from './cumulusSlice';
//import type { HashTable } from './CumulusHashTables';
import {
  dateDisplayString,
  dateTimeDisplayString,
  timeDisplayString,
  timezoneDisplayString,
} from './dateFormatHelpers';
//import fastaHashTableToUrl from './fastaHashTableToUrl';
import { isMissingDeclaration } from 'typescript';

const Slider = () => {
  // We display a fixed number of slots
  const nTimeslots = 46;

  // We default to the the latest observation slot
  const defaultSliderValue = 0;

  //const slot_ms = 15 * 60 * 1000; // duration of 1 timeslot in msecs

  const dispatch = useDispatch();

  //const fastaHashes: HashTable[] = useSelector(selectHashTables);
  //const fastaLatestTimeslot: number | null = useSelector(selectLatestTimeslot);

  const [sliderSlots, setSliderSlots] = useState<number[]>([]);

  const [selectedEntry, setSelectedEntry] = useState<number>();

  const [selectedEntryString, setSelectedEntryString] = useState('Lead time:');

  const [currentSliderValue, setCurrentSliderValue] =
    useState<number>(defaultSliderValue);

  const [userMessageGeneral, setUserMessageGeneral] = useState<
    string | undefined
  >();

  // Current date time in msecs, and first timeslot in msecs
  const [currentTimeMsecs, setCurrentTimeMsecs] = useState<number>(Date.now());

  useEffect(() => {
    /* Initial selection / positioning
     */

    // We have an array of slider slots, which are lead times,
    // in hours, from 0 to 1108:
    // So they go 24, 48, 72, ... , 1108
    const slots = Array(nTimeslots)
      .fill(0)
      .map((_, i) => (i + 1) * 24);
    setSliderSlots(slots);

    console.log('sliderSlots: ' + slots);
    console.log('sliderSlots[0]: ' + slots[0]);
    setSelectedEntry(slots[0]);
  }, []);

  // Handle changes to slider selection
  useEffect(() => {
    //console.log("Slider::useEffect(), [selectedTimeslot]");
    console.log('selectedEntry:' + selectedEntry);

    if (selectedEntry == null) {
      return;
    }

    // Format the selected entry as a lead time string in hours,
    // padded with a leading zero if necessary
    const strSelected = selectedEntry.toString().padStart(3, '0') + 'h';

    setSelectedEntryString('Lead time: +' + strSelected);

    console.log('strSelected:' + strSelected);
    dispatch(updateSelectedEntry(strSelected));
  }, [selectedEntry]);

  return (
    <div>
      <div className="slider-message">
        {userMessageGeneral && (
          <div className="slider-message-label">{userMessageGeneral}</div>
        )}
      </div>
      <div className="slider">
        <div className="slider-time-label">{selectedEntryString}</div>
        <div className="slider-controls">
          <div className="slider-container">
            <ReactSlider
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              withTracks
              onChange={(value) => {
                console.log('onChange value=' + value);
                setCurrentSliderValue(value);
                console.log('sliderSlots: ' + sliderSlots.length);
                if (value >= 0 && value <= sliderSlots.length) {
                  console.log('setSelectedEntry(' + sliderSlots[value] + ')');
                  setSelectedEntry(sliderSlots[value]);
                }
              }}
              value={currentSliderValue}
              //defaultValue={defaultSliderValue}
              markClassName="customSlider-mark"
              min={0}
              max={nTimeslots - 1}
            />
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
