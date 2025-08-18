import React, { useState } from "react";
import './drawingToggles.css'
import {
    updateIsDrawing,
    updateIsEraser,
    updateFreehand,
    selectEraser,
    selectIsDrawing,
    selectFreehand,
    selectMode,
    updateMode
} from "./drawlingSlice";
import { useDispatch, useSelector } from "react-redux";


const DrawingToggles = (({ id }: { id: string }) => {
    const isDraw = useSelector(selectIsDrawing);
    const isErase = useSelector(selectEraser);
    const isFreehand = useSelector(selectFreehand);
    const mode = useSelector(selectMode);
    const [drawChecked, setDrawChecked] = useState<boolean>(isDraw);
    const [eraseChecked, setEraseChecked] = useState<boolean>(isErase);
    const [freehandChecked, setFreehandChecked] = useState<boolean>(isFreehand);
    const [modeChecked, setModeChecked] = useState<boolean>();
    const dispatch = useDispatch();

    const blackText: React.CSSProperties = {
        color: 'black',
    }

    const handleDrawChange = (() => {
        if (drawChecked) {
            dispatch(updateIsDrawing(false));
            setDrawChecked(false);
        } else {
            dispatch(updateIsDrawing(true));
            setDrawChecked(true);
            if (isErase) {
                setEraseChecked(false);
                dispatch(updateIsEraser(false));
            }
        };
    });

    const handleEraseChange = (() => {
        if (eraseChecked) {
            dispatch(updateIsEraser(false));
            setEraseChecked(false);
        } else {
            dispatch(updateIsEraser(true));
            setEraseChecked(true);
            if (isDraw) {
                setDrawChecked(false);
                dispatch(updateIsDrawing(false));
            }
        };
    })

    const handleFreehandChange = (() => {
        if (freehandChecked) {
            setFreehandChecked(false);
            dispatch(updateFreehand(false));
        } else {
            setFreehandChecked(true);
            dispatch(updateFreehand(true));
        }
    });

    const handleModeChange = (() => {
        if (mode === 'Polygon') {
            setModeChecked(true);
            dispatch(updateMode('LineString'))
        } 
        if (mode === 'LineString') { 
            setModeChecked(false);
            dispatch(updateMode('Polygon'))
        }
    })

    return (
        <div style={blackText}>
            <p> Toggle Draw: </p>
            <label className="switch">
                <input type="checkbox" checked={drawChecked} onChange={handleDrawChange} />
                <span className="slider round"> </span>

            </label>

            <p> Toggle Erase: </p>
            <label className="switch">
                <input type="checkbox" checked={eraseChecked} onChange={handleEraseChange} />
                <span className="slider round"> </span>

            </label>

            <p> Toggle Freehand: </p>
            <label className="switch">
                <input type="checkbox" checked={freehandChecked} onChange={handleFreehandChange} />
                <span className="slider round"> </span>

            </label>

            <p> Toggle Mode: </p>
            <label className="switch">
                <input type="checkbox" checked={modeChecked} onChange={handleModeChange} />
                <span className="slider round"> </span>
            </label>
        </div>
    )
})

export default DrawingToggles;