import React from 'react'; 
import './FastaMainMenu.css';

const FastaMainMenu = (props) => {
    return (
        <div className='FastaMainMenu'>
            {props.children}
        </div>
    )
}

export default FastaMainMenu;
