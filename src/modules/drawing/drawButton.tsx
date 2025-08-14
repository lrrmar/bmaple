import './drawingButton.css';
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateName, selectName, updateIsDrawing, updateMode, selectIsDrawing, selectFreehand, updateFreehand, selectEraser, updateIsEraser } from "./drawlingSlice";


const DrawButton = (({ type }: { type: string }) => {
    const dispatch = useDispatch();
    const [currentText, setCurrentText] = useState<string>();
    const oldLayerName = useSelector(selectName);
    const isDraw = useSelector(selectIsDrawing);
    const isFreehand = useSelector(selectFreehand);
    const isErase = useSelector(selectEraser);

    const handleOnClick = (() => {
        if(isDraw){
            dispatch(updateIsDrawing(false));
        } else {
            dispatch(updateIsDrawing(true));
            dispatch(updateIsEraser(false));
        }
    })

    const handleFreehandClick = (() => {
        if (isFreehand){
            dispatch(updateFreehand(false));
        } else {
            dispatch(updateFreehand(true));
        }
    })

    const handleEraserClick = (() => {
        if (isErase) {
            dispatch(updateIsEraser(false));
        } else {
            dispatch(updateIsEraser(true));
            if (isDraw){
                dispatch(updateIsDrawing(false));
            }
        }
    })

    return (
        <div className='roundButton'>
            <button className='roundButtonCircle' onClick={handleOnClick}> On </button>
            <button className='roundButtonCircle' onClick={handleFreehandClick}>Freehand</button>
            <button className='roundButtonCircle' onClick={(handleEraserClick)}>Erase</button>
        </div>
    )

})

export default DrawButton;