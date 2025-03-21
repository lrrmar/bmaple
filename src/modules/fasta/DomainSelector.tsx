import React, {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
    //useRef,
} from 'react';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import './ProductSelector.css';
import {
    FastaProduct,
    selectHashTables,
    selectFastaProducts,
    updateFastaProducts,
} from './fastaSlice';
import { current } from '@reduxjs/toolkit';
import { HashTable } from './FastaHashTables';


interface Props {
    setDomain: Dispatch<SetStateAction<string>>;
}

const DomainSelector = ({ setDomain }: Props) => {
    
    const dispatch = useDispatch();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const domains = ["Zambia", "Mozambique"];

    function changeHandler(event: ChangeEvent<HTMLSelectElement>): void {
        console.log("domain changed! " + event.target.value);
        setDomain(event.target.value);
    }

    return (
        <div className="domain-selector">
            <select name="select" onChange={changeHandler} >
            {domains.map((d : string, index : number) => (
                <option value={domains[index]}
                        selected={selectedIndex === index}>
                    {d}
                </option>
            ))}
            </select>
        </div>                        
    );
};

export default DomainSelector;
