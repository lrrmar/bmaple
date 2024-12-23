import React, {
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


const ProductSelector = () => {

    
    const dispatch = useDispatch();
    const products : FastaProduct[] = useSelector(selectFastaProducts);
    //const fastaHashes : HashTable[] = useSelector(selectHashTables);


    useEffect(() => {

        /*
        const crr : FastaProduct =  {
            order: 0,
            name: "CRR",
            visible: true,
        };

        const rdt : FastaProduct = {
            order: 1,
            name: "RDT",
            visible: false,
        };
        */

        //const prods = [ crr, rdt ];
        //dispatch(updateFastaProducts(prods));
    }, []);


    const handleCheckboxChange = (e : any, value : string) => {

        const checked = e.target.checked;    
        var states : FastaProduct[] = [...products];
        const idxProduct : number = states.findIndex((pr) => pr.name === value);
        if (idxProduct !== -1) {
            var productToChange : FastaProduct = {...states[idxProduct]};
            productToChange.visible = checked;
            states[idxProduct] = productToChange;
        }
        //console.log(states);
        dispatch(updateFastaProducts(states));
    };

    return (
        <div className="product-selector">
            <ul>
            {products.map((p : FastaProduct, index : number) => (
            <li key={index}>
                <label>
                    <input type="checkbox"
                        defaultChecked={p.visible}
                        name={p.name}
                        value={p.name}
                        onChange={(e) => handleCheckboxChange(e, p.name)}
                    />
                    {p.name}
                </label>
            </li>
            ))}
            </ul>
        </div>
    );
};

export default ProductSelector;
