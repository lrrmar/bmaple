import React from "react";
import { useState, useEffect } from "react";
import { capSlice, selectStyle } from "./capSlice";
import { selectCrrChosenStyle } from "../fastaSlice";
import { useSelector } from "react-redux";
import './collapsibleMenu.css';


const CollapseColourBar = (({ id }: { id: string }) => {
    const [openedBar, setOpenedBar] = useState<boolean>(false);
    const [openedKey, setOpenedKey] = useState<boolean>(false);
    const [currentStyle, setCurrentStyle] = useState<string>("rainbow");
    const [currentCapStyle, setCurrentCapStyle] = useState<string[]>([""]);
    const styleForGrad = useSelector(selectCrrChosenStyle);
    const styleForCap = useSelector(selectStyle)
    const styleArr: { [key: string]: string[] }  = {
        'default': ['#ff0000', '#ec8100', '#ffe909', '#baff04', '#a0fffd'],
        'rainbow': ['#2579d4', '#2a8cf0', '#1cd0f5', '#428730', '#31c749'],
        'tol': ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77'],
        'viridis': ['#fde725', '#c2df23', '#86d549', '#52c569', '#2ab07f'],
    }
    const tempStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: '2em',

    }



    // use effect so that the colour bar will update when the style updates
    useEffect(() => {
        if (styleForGrad === 'rainbow') {
            setCurrentStyle("rainbowStyle");
        } else if (styleForGrad === 'tol') {
            setCurrentStyle("tolStyle");
        } else if (styleForGrad === 'viridis') {
            setCurrentStyle("viridisStyle");
        } else {
            setCurrentStyle(" ");
        }

    }, [styleForGrad])

    useEffect(() => {
        setCurrentCapStyle(styleArr[styleForCap])



    }, [styleForCap])




    return (
        <>
            <div >
                <button type="button" onClick={() => { setOpenedBar(prev => !prev) }}>
                    <div>{!openedBar ? '▲' + "Open CRR Scale" : '▼' + " Close CRR Scale"}</div>
                </button>

                {openedBar ?
                    (
                        <div style={tempStyle}>
                            <p className="p-black">    low   </p>
                            <div className={currentStyle}>

                            </div>
                            <p className="p-black">     high    </p>
                        </div>) : (<div> </div>)
                }
            </div>
            <div >
                <button type="button" onClick={() => { setOpenedKey(prev => !prev) }}>
                    <div>{!openedKey ? '▲' + "Open CAP Key" : '▼' + " Close CAP Key"}</div>
                </button>

                {openedKey ?
                    (<div style={tempStyle}>
                        <p className="p-black"> minor</p> <div style = {{background: currentCapStyle[0]}} className="littleBox"> </div> 
                        <p className="p-black"> moderate</p> <div style = {{background: currentCapStyle[1]}} className="littleBox"> </div>
                        <p className="p-black"> severe</p> <div style = {{background: currentCapStyle[2]}} className="littleBox"> </div>
                        <p className="p-black"> extreme</p> <div style = {{background: currentCapStyle[3]}} className="littleBox"> </div>


                    </div>
                    ) : (<div> </div>)
                }
            </div>

        </>
    );
})


export default CollapseColourBar;