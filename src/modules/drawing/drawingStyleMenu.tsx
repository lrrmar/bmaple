import React, {useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectStyleArray, updateStyleArray } from "./drawlingSlice";


const DrawingStyleMenu = (({ id }: { id: string }) => {
    const dispatch = useDispatch();
    // strokecolour, stroke width, fill colour, opacity
    const styleArray = useSelector(selectStyleArray);
    const numberArray: number[] = (() => {
        const arr: number[] = [0];
        for (let i = 1; i < 11; i++) {
            arr.push(i);
        }
        return arr;
    })();

    const blackText: React.CSSProperties = {
        color: 'black',
    }

    // line colour
    const handleLineColour = ((colour: string) => {

        dispatch(updateStyleArray({
            strokeColour: colour.toLowerCase(),
            strokeWidth: styleArray['strokeWidth'],
            fillColour: styleArray['fillColour'],
            opacity: styleArray['opacity'],
        }));
        console.log(styleArray)

    })

    const handleFillColour = ((colour: string) => {

        dispatch(updateStyleArray({
            strokeColour: styleArray['strokeColour'],
            strokeWidth: styleArray['strokeWidth'],
            fillColour: colour.toLowerCase(),
            opacity: styleArray['opacity'],
        }));
    });

    const handleStrokeWidth = ((width: string) => {
        dispatch(updateStyleArray({
            strokeColour: styleArray['strokeColour'],
            strokeWidth: width,
            fillColour: styleArray['fillColour'],
            opacity: styleArray['opacity'],
        }));
    })
    
    const handleOpacity = ((opacity: string) => {
        dispatch(updateStyleArray({
            strokeColour: styleArray['strokeColour'],
            strokeWidth: styleArray['strokeWidth'],
            fillColour: styleArray['fillColour'],
            opacity: opacity,
        }));
    })

    return (
        <div>
            <label style={blackText} htmlFor="fillColour"> Select Fill Colour: </label>
            <select id="fill" defaultValue={styleArray['fillColour']} onChange={(event) => handleFillColour(event.target.value)}>
                <option value="none">No Fill</option>
                <option value="black">Black</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
            </select>
            <br /> <br />
            <label style={blackText} defaultValue={styleArray['strokeColour'].toLowerCase()} htmlFor="strokeColour"> Select Line Colour: </label>
            <select id="line" onChange={(event) => handleLineColour(event.target.value)}>
                <option value="none">No Line</option>
                <option value="black">black</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
            </select>
            <br /> <br />
            <label style={blackText} htmlFor="lineWidth"> Select Line Width: </label>
            <select id="line" defaultValue={numberArray[Number(styleArray['strokeWidth'])]} onChange={(event) => handleStrokeWidth(event.target.value)}>
                {numberArray.map((number) => {
                    return <option value={number}>{number}px</option>
                })}
            </select>
            <label style={blackText} htmlFor="lineWidth"> Select Opacity: </label>
            <input  
                type="range"
                id="opacity"
                min="0"
                max="1"
                step ="0.01"
                onChange={(element) => {handleOpacity(element.target.value)}} /> 
        </div>
    )
})

export default DrawingStyleMenu;