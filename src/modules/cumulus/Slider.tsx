import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactSlider from 'react-slider';
import './Slider.css';
import {
  //selectHashTables,
  selectSelectedDayOfYear,
  selectSelectedEntry,
  updateSelectedDayOfYear,
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

  const [selectedSlot, setSelectedSlot] = useState<number>();

  const [selectedEntry, setSelectedEntry] = useState<number>();

  const [selectedEntryString, setSelectedEntryString] =
    useState('Forecast step:');

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
    //console.log('fastaLatestTimeslot:' + fastaLatestTimeslot);
    // Start the slider 2 hours (8 slots) previous of latest slot:
    //const firstMsecs = fastaLatestTimeslot - 8 * slot_ms;
    //const slots = Array(nTimeslots)
    //  .fill(0)
    //  .map((_, i) => i);
    //  .map((_, i) => firstMsecs + i * slot_ms);
    //console.log('slots:');
    //console.log(slots);
    //console.log(timeslots);
    //setSliderSlots(slots);
    //console.log('sliderSlots:');
    //console.log(sliderSlots);
    //setSelectedTimeslot(timeslots[defaultSliderValue]);

    setSelectedEntry(0);
  }, []);

  // Handle changes to slider selection
  useEffect(() => {
    //console.log("Slider::useEffect(), [selectedTimeslot]");
    console.log('selectedEntry:' + selectedEntry);

    if (selectedEntry == null) {
      return;
    }

    const strSelected = '' + selectedEntry;

    setSelectedEntryString('Forecast step: +' + strSelected + ' days');

    dispatch(updateSelectedEntry(strSelected));

    /*
    if (selectedTimeslot) {
      const strSelected = dateTimeDisplayString(selectedTimeslot);
      setSelectedTimeString(strSelected);

      if (Date.now() - fastaLatestTimeslot >= 60 * 1000 * 60) {
        setUserMessageGeneral('WARNING: latest data is from > 1 hour ago.');
      }

      //console.log("setSelectedTimeslot:" + strSelected);

      setTimeZoneString(timezoneDisplayString(selectedTimeslot));

      // Find the CRR hash with matching effective_ts
      const crrLayerHash = fastaHashes.find((hash: HashTable) => {
        return hash.name === 'crr' && hash.effective_ts === selectedTimeslot;
      });

      if (crrLayerHash) {
        if (crrLayerHash.is_available) {
          const url = fastaHashTableToUrl(crrLayerHash);
          const newCrrLayerHash = { apiRequest: url };
          setUserMessageCrr(undefined);
          dispatch(updateSelectedCrrId(newCrrLayerHash.apiRequest));
        } else {
          setUserMessageCrr(
            'CRR: data not available for ' +
              timeDisplayString(crrLayerHash.effective_ts) +
              ' slot',
          );
          dispatch(updateSelectedCrrId(null));
        }
      } else {
        setUserMessageCrr('CRR: data not available');
        dispatch(updateSelectedCrrId(null));
      }

      // Find the RDT hash with matching effective_ts
      const rdtLayerHash = fastaHashes.find((hash: HashTable) => {
        return hash.name === 'rdt' && hash.effective_ts === selectedTimeslot;
      });

      if (rdtLayerHash) {
        if (rdtLayerHash.is_available) {
          const url = fastaHashTableToUrl(rdtLayerHash);
          console.log(url);
          const newRdtLayerHash = { apiRequest: url };
          dispatch(updateSelectedRdtId(newRdtLayerHash.apiRequest));

          if (rdtLayerHash.completeness && rdtLayerHash.completeness < 92) {
            setUserMessageRdt(
              'RDT: data incomplete ' +
                rdtLayerHash.completeness +
                '% for ' +
                timeDisplayString(rdtLayerHash.effective_ts) +
                ' slot',
            );
          } else {
            setUserMessageRdt(undefined);
          }
        } else {
          setUserMessageRdt(
            'RDT: data not available for ' +
              timeDisplayString(rdtLayerHash.effective_ts) +
              ' slot',
          );
          dispatch(updateSelectedRdtId(null));
        }
      } else {
        // No forecasts for RDT
        if (selectedTimeslot <= fastaLatestTimeslot) {
          setUserMessageRdt('RDT: data not available');
        }
        dispatch(updateSelectedRdtId(null));
      }

      // Find the LI hash with matching effective_ts
      const liLayerHash = fastaHashes.find((hash: HashTable) => {
        return hash.name === 'li' && hash.effective_ts === selectedTimeslot;
      });

      if (liLayerHash) {
        if (liLayerHash.is_available) {
          const url = fastaHashTableToUrl(liLayerHash);
          const newLiLayerHash = { apiRequest: url };
          dispatch(updateSelectedLightningId(newLiLayerHash.apiRequest));
          setUserMessageLi(undefined);
        } else {
          setUserMessageLi(
            'LI: data not available for ' +
              timeDisplayString(liLayerHash.effective_ts) +
              ' slot',
          );
          dispatch(updateSelectedLightningId(null));
        }
      } else {
        // No forecasts for LI
        if (selectedTimeslot <= fastaLatestTimeslot) {
          setUserMessageLi('LI: data not available');
        }
        dispatch(updateSelectedLightningId(null));
      }

      if (selectedTimeslot > fastaLatestTimeslot) {
        setUserMessageRdt('Forecasts are not displayed for RDT and lightning');
        setUserMessageLi(undefined);
      }
    }
    */
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
                setSelectedEntry(value);
                /*
                console.log('sliderSlots: ' + sliderSlots.length);
                if (value >= 0 && value <= sliderSlots.length) {
                  console.log('setSelectedSlot(' + sliderSlots[value] + ')');
                  setSelectedSlot(sliderSlots[value]);
                }
                  */
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
