import React from "react";
import { useState, useEffect } from "react";
import { capSlice, selectStyle } from "./capSlice";
import { selectCrrChosenStyle } from "../fastaSlice";
import { useSelector } from "react-redux";
import './collapsibleMenu.css';

interface Props {
    name: string,
    id: string,
}

const CollapseColourBar = (({ id, name }: Props) => {
    const [openedBar, setOpenedBar] = useState<boolean>(false);
    const [openedKey, setOpenedKey] = useState<boolean>(false);
    const [currentStyle, setCurrentStyle] = useState<string>("rainbow");
    const [currentCapStyle, setCurrentCapStyle] = useState<string[]>([""]);
    const styleForGrad = useSelector(selectCrrChosenStyle);
    const styleForCap = useSelector(selectStyle)
    const styleArr: { [key: string]: string[] } = {
        'default': ['#ff0000', '#ec8100', '#ffe909', '#baff04', '#a0fffd'],
        'rainbow': ['#2579d4', '#2a8cf0', '#1cd0f5', '#428730', '#31c749'],
        'tol': ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77'],
        'viridis': ['#fde725', '#c2df23', '#86d549', '#52c569', '#2ab07f'],
    }
    const [capKey, setCapKey] = useState<boolean>(false);
    const tempStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",

    }

    useEffect(() => {
        if (name === 'CAP') {
            setCapKey(true);
        } else {
            setCapKey(false);
        }
    }, [])


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
            {!capKey ?
                (
                    <div >
                        <p className="p-black">    low   </p>

                        <div className={currentStyle}/>

                       
                        <p className="p-black">     high    </p>
                    </div>
                ) : (
                <div >
                    <h2 className="h2"> Key for CAP Alerts: </h2>
                    <p className="p-black"> minor</p> <div style={{ background: currentCapStyle[0] }} className="littleBox"> </div>
                    <p className="p-black"> moderate</p> <div style={{ background: currentCapStyle[1] }} className="littleBox"> </div>
                    <p className="p-black"> severe</p> <div style={{ background: currentCapStyle[2] }} className="littleBox"> </div>
                    <p className="p-black"> extreme</p> <div style={{ background: currentCapStyle[3] }} className="littleBox"> </div>
                </div>
                )


            }

        </>
    );
})


export default CollapseColourBar;