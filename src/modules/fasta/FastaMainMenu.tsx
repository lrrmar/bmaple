import React from 'react'; 
import './FastaMainMenu.css';

const FastaMainMenu = (props : any) => {
    return (
        <div className='FastaMainMenu'>
            {props.children}
        </div>
    )
}

export default FastaMainMenu;
