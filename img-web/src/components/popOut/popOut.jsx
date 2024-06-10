import React, { useState, useEffect } from 'react';
import './popOut.css';

export const PopOut = ({popOutType, dataType="", contents, close, submit_func}) => {

  const [inputData, setInputData] = useState(contents);

  const handleInputChange = (index, value) => {
    const updatedData = inputData.map((data, i) => 
      i === index ? { ...data, data: value } : data
    );
    setInputData(updatedData);
  }

  useEffect(() => {
    if(popOutType != "edit"){
      const updatedData = inputData.map((data, i) => ({
        ...data,
        data: ""
      }));
      setInputData(updatedData);
    }
  }, []);

  return (
    <div className='pop_out_bg'>
      <div className='pop_out_container'>
        <h2>{popOutType === "edit" ? `編輯` : `新增`}{dataType}</h2>
        <span className="material-symbols-outlined pop_out_close_btn" onClick={() => {close()}}>close</span>
        {inputData.map((data, index) => (
          data[popOutType].visible && (
            <div className='input_row_container' key={index}>
              <div className='input_title_container'>
                <h3>{data.showed_attr_name}</h3>
              </div>
              <div className='input_entry_container'>
                <input key={index} value={data.data} disabled={data[popOutType].disable} onChange={(e) => handleInputChange(index, e.target.value)}/>
              </div>
            </div>
          )
        ))}
        <button onClick={() => {submit_func(inputData)}}>{popOutType === "edit" ? `確認編輯` : `確認新增`}</button>
      </div>
    </div>
  );
}

export default PopOut;
