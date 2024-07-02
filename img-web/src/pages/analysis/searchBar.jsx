import React from 'react';
import './searchBar.css';

export const SearchBar = ({data, handleInputChange, selectedRow, handleInvestigateClick}) => {

    return (
        <div className='function_bar_container'>
            <div className='empty_bar_container'></div>
            <div className='input_entry_container'>
                <input placeholder="搜尋團購id" autoComplete="on" list={data.attr} value={data.data} onChange={(e) => handleInputChange(e.target.value)}/> 
                <datalist id={data.attr}>
                    {data.options && Object.values(data.options).map((opt, index) => (
                    <option key={index} value={opt}></option>
                    ))}
                </datalist>
            </div>
            <div className='investigate button'>
                <button disabled={selectedRow === null} onClick={() => handleInvestigateClick(selectedRow)}>查看分析</button>
            </div>
        </div>
        
    );
};

export default SearchBar;
