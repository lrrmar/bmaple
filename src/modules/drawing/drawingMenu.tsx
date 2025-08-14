import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateName, selectName, updateIsDrawing, updateMode } from "./drawlingSlice";
import { selectCache } from "../../mapping/cacheSlice";


const DrawingMenu = (({ id }: { id: string }) => {
    const dispatch = useDispatch();
    const allCache = useSelector(selectCache);
    const [currentText, setCurrentText] = useState<string>();
    const oldLayerName = useSelector(selectName);
    const [layerList, setLayerList] = useState<string[]>();

    // creates a new layer
    const handleClick = (() => {
        if (currentText !== oldLayerName && currentText) {
            dispatch(updateName(currentText))
        }

    })

    // gets all the layer names currently in cache
    useEffect(() => {
        const filteredIds = Object.keys(allCache).filter((id) => {
            const cacheObj = allCache[id];
            return cacheObj.source === 'draw';
        })

        const layerNameList:string[] = [];
        filteredIds.forEach((id) => {
            const index = layerNameList.findIndex((layerName) => {
                return layerName === String(allCache[id].layerName)
            })
            if (index === -1 ) { 
                layerNameList.push(String(allCache[id].layerName))
            }
        })

        if ( JSON.stringify(layerList) !== JSON.stringify(layerNameList)){
            setLayerList(layerNameList);
        }


    }, [allCache])

    const changeLayerName = ((layerName:string) => { 
        dispatch(updateName(layerName));
    })

    return (
        <div>
            <h4> Enter New Layer Name </h4>
            <input type="text" id="layerName" name="layerName" onChange={(element) => { setCurrentText(element.target.value) }} />
            <input type="button" value="confirm" onClick={handleClick} />
            <div>
                {layerList?.map((layerName) => {
                    return(
                        <button onClick={() => changeLayerName(layerName)}>{layerName}</button>
                    );
                })}
            </div>
            
        </div>
    )

})

export default DrawingMenu;