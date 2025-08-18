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

    const overallStyle: React.CSSProperties = {
        color: 'black', 
        width: '90%', 
        height: '95%', 
        margin: '5%',
        display: 'flex',
        flexDirection: 'column',
    }
    
    const inputStyle: React.CSSProperties = { 
        width: '90%',
    }

    const buttonStyle: React.CSSProperties = { 
        width: '80%',
        height: '100%',
        margin: '3px',
        border: 'solid 2px black',
        borderRadius: '4px'

    }
    // creates a new layer
    const handleClick = (() => {
        if (currentText !== oldLayerName && currentText) {
            dispatch(updateName(currentText))
            setCurrentText("");
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

        const currentLayerIndex = layerNameList.findIndex((layerName) => { 
            return layerName === oldLayerName;
        })

        if ( currentLayerIndex === -1) { 
            layerNameList.push(String(oldLayerName))
        }

        if ( JSON.stringify(layerList) !== JSON.stringify(layerNameList)){
            setLayerList(layerNameList);
        }

    }, [allCache, oldLayerName])

    const changeLayerName = ((layerName:string) => { 
        dispatch(updateName(layerName));
    })

    return (
        <div style={overallStyle}>
            <p> Enter New Layer Name </p>
            <input style={inputStyle} value= { currentText} type="text" id="layerName" name="layerName" onChange={(element) => { setCurrentText(element.target.value) }} />
            <input type="button" value="confirm" onClick={handleClick} />
            <div>
                <ul> 
                {layerList?.map((layerName) => {
                    return(
                       <li> <button style={buttonStyle} onClick={() => changeLayerName(layerName)}>{layerName}</button></li>
                    );
                })}
                </ul>
            </div>
            
        </div>
    )

})

export default DrawingMenu;