import React, { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { CacheElement, cacheSlice, selectCache } from "../../../mapping/cacheSlice";
import './capPanel.css';
import PopUp from "../../../features/PopUp";
import { selectCountry, selectOluid, selectSeverity } from "./capSlice";
import { current } from "@reduxjs/toolkit";



/*
  CAP PANEL COMPONENT:
    ~ Get all of the CAP warnings from cache
    ~ Make a dynamic list of all caps 
    ~ List should be clickable
    ~ On click, a pop up should come up that displays all the information for the CAP
*/



const CapPanel = (({ id }: { id: string }) => {
    const [capList, setCapList] = useState<string[]>([]);
    const [openPopup, setOpenPopUp] = useState<boolean>(false);
    const [cacheObj, setCacheObj] = useState<CacheElement>();

    const currentCountry = useSelector(selectCountry);
    const currentSeverity = useSelector(selectSeverity);
    const currentOluid = useSelector(selectOluid);
    const allCache = useSelector(selectCache);

    const getURL = (() => {
        return String(cacheObj?.link);
    })

    const getEventByID = ((id: string) => {
        return String(allCache[id].event)
    })

    const getCountryByID = ((id: string) => {
        return String(allCache[id].country)
    })

    const getFastaIdByID = ((id:string) => {
        return String(allCache[id]?.fastaId)
    })

    // get updated cap list every time the cache is changed 
    useEffect(() => {
        const filteredIds = Object.keys(allCache).filter((id) => {
            const element = allCache[id];
            const matchesSource = element?.source === 'cap';
            const hasUID = !!element?.ol_uid;
            const matchesOLUID = element?.ol_uid === currentOluid || currentOluid === 'All';
            const matchesCountry = element?.country === currentCountry || currentCountry === 'All';
            const matchesSeverity = element?.severity === currentSeverity || currentSeverity === 'All';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
            return matchesSource && hasUID && matchesCountry && matchesSeverity && matchesOLUID;
        });

        setCapList(filteredIds);
    }, [allCache, currentCountry, currentSeverity, currentOluid])

    return (
        <div className="scrollable" id={id}>
            <label htmlFor="capList">CAP List: </label>
            <div id="capList">
                {!openPopup && (
                    <>
                        {
                            capList.map((id, i) => {
                                return <button className="button-cap" onClick={() => { setOpenPopUp(true); setCacheObj(allCache[id]); }} key={i} value={id} >
                                    <p> {getFastaIdByID(id)} <br/> </p>
                                    <h2>{getEventByID(id)}</h2>
                                    <h3> {getCountryByID(id)}</h3>
                                </button>
                            })
                        }
                    </>
                )}

            </div>
            <PopUp showPopUp={openPopup} closePopUp={() => setOpenPopUp(false)}>
                <div className="div=info">
                    <p>
                        Event : {String(cacheObj?.event)} <br />
                        Severity: {String(cacheObj?.severity)}<br />
                        Country: {String(cacheObj?.country)}<br />
                        Start Date/Time: {String(cacheObj?.start)}<br />
                        End Date/Time: {String(cacheObj?.end)}<br />
                        <a className='a-cap' href={getURL()}>link to CAP</a><br />
                    </p>
                </div>
            </PopUp>
        </div>


    )
})

export default CapPanel;