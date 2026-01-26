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
  timestampAsUrlParamString,
} from './dateFormatHelpers';
//import fastaHashTableToUrl from './fastaHashTableToUrl';
import { isMissingDeclaration } from 'typescript';

const SliderStartDate = () => {
  // We display a fixed number of slots
  const nTimeslots = 211;

  // We default to the the latest observation slot
  const defaultSliderValue = 0;

  //const slot_ms = 15 * 60 * 1000; // duration of 1 timeslot in msecs

  const dispatch = useDispatch();

  //const fastaHashes: HashTable[] = useSelector(selectHashTables);
  //const fastaLatestTimeslot: number | null = useSelector(selectLatestTimeslot);

  const [sliderSlots, setSliderSlots] = useState<number[]>([]);

  const [selectedDate, setSelectedDate] = useState<number>();
  const [selectedDateString, setSelectedDateString] = useState('');

  const [currentSliderValue, setCurrentSliderValue] =
    useState<number>(defaultSliderValue);

  // Current date time in msecs, and first timeslot in msecs
  const [currentTimeMsecs, setCurrentTimeMsecs] = useState<number>(Date.now());

  useEffect(() => {
    /* Initial selection / positioning
     */

    //console.log('fastaLatestTimeslot:' + fastaLatestTimeslot);

    const startDate = new Date('2025-02-01');
    const endDate = new Date('2025-08-31');

    // Calculate difference in days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateTimestamps = [...Array(diffDays + 1)].map((_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date.getTime();
    });

    setSliderSlots(dateTimestamps);
    setSelectedDate(dateTimestamps[0]);
  }, []);

  // Handle changes to slider selection
  useEffect(() => {
    //console.log("Slider::useEffect(), [selectedTimeslot]");
    console.log('selectedDate:' + selectedDate);

    if (!selectedDate) {
      return;
    }

    const strSelectedDate = dateDisplayString(selectedDate);
    setSelectedDateString('Forecast start date: ' + strSelectedDate);

    const urlString = timestampAsUrlParamString(selectedDate);
    dispatch(updateSelectedDayOfYear(urlString));

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
  }, [selectedDate]);

  /*
  useEffect(() => {
    if (!sliderTimeslots) {
      return;
    }

    const firstTimeslotMsecs = sliderTimeslots[0];
    const lastTimeslotMsecs = sliderTimeslots[nTimeslots - 1];

    if (!firstTimeslotMsecs) {
      return;
    }
    if (!lastTimeslotMsecs) {
      return;
    }

    // We need to work out where to position the "now" label on the slider.
    // We do this by using 3 divs: 1 for the "now" label and 1 either side.

    const totalMsecs = lastTimeslotMsecs - firstTimeslotMsecs;

    const msecsFirstToNow = currentTimeMsecs - firstTimeslotMsecs;
    const msecsNowToLast = lastTimeslotMsecs - currentTimeMsecs;

    // div2 containing the "now" text will occupy width equivalent to 2 slots:
    const div1Msecs = msecsFirstToNow - slot_ms;
    const div3Msecs = msecsNowToLast - slot_ms;

    const div1Percent = Math.round((div1Msecs / totalMsecs) * 100);
    const div3Percent = Math.round((div3Msecs / totalMsecs) * 100);
    const div2Percent = 100 - div1Percent - div3Percent;

    setTicksDiv1Width(div1Percent + '%');
    setTicksDiv2Width(div2Percent + '%');
    setTicksDiv3Width(div3Percent + '%');
  }, [sliderSlots, currentTimeMsecs]);
*/

  return (
    <div>
      <div className="slider">
        <div className="slider-time-label">{selectedDateString}</div>
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
                if (value >= 0 && value <= sliderSlots.length) {
                  console.log('setSelectedDate(' + sliderSlots[value] + ')');
                  setSelectedDate(sliderSlots[value]);
                }
              }}
              value={currentSliderValue}
              markClassName="customSlider-mark"
              min={0}
              max={nTimeslots - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderStartDate;
