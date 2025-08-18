import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectZoom, updateMapZoom} from '../../mapping/mapSlice'


const Zoom = (() => { 
    const mapZoom = useSelector(selectZoom)
    const dispatch = useDispatch();


    const handleIn = (() => { 
        if ( mapZoom) { 
            const newMapZoom = mapZoom + 0.25;
            dispatch(updateMapZoom(newMapZoom));
        }
    })

    const handleOut = (() => { 
        if ( mapZoom) { 
            const newMapZoom = mapZoom - 0.25;
            dispatch(updateMapZoom(newMapZoom));
        }

    })
    const divStyle: React.CSSProperties = { 
        display: 'flex', 
        flexDirection: 'column'
    }
    const buttonStyle: React.CSSProperties = {
        width: '30px',
        height: '30px', 
        border: 'solid 1px black',
        borderRadius: '3px',
        fontSize: '20px'
    }

    return (
        <div style={divStyle}>
            <button style={buttonStyle} onClick={handleIn} > + </button>
            <button style={buttonStyle} onClick={handleOut}> - </button>
        </div>
    )

})

export default Zoom;