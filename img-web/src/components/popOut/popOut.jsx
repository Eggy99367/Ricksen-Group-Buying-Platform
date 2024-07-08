import React, { useState, useEffect } from 'react';
import './popOut.css';

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const PopOut = ({popOutType, dataType="", contents, close, submit_func}) => {

  const [inputData, setInputData] = useState(contents);

  const handleInputChange = (index, value) => {
    const updatedData = inputData.map((data, i) => 
      i === index ? { ...data, data: value } : data
    );
    setInputData(updatedData);
  }

  useEffect(() => {
    if(popOutType !== "edit"){
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
        <span className="material-symbols-outlined pop_out_close_btn no_select" onClick={() => {close()}}>close</span>
        {inputData.map((data, index) => (
          data[popOutType].visible && (
            <div className='input_row_container' key={index}>
              <div className='input_title_container'>
                <h3>{data.showed_attr}</h3>
              </div>
              <div className='input_entry_container'>
                {data[popOutType].entry_type === "setdropdown" ? (
                  <div className='input_entry_container'>
                    <select name="dropdown" id={data.attr} value={data.data} disabled={data[popOutType].disable} onChange={(e) => handleInputChange(index, e.target.value)}>
                    {Object.values(data.options).map((opt, index) => (
                        <option value={opt[0]}>{opt[0]}</option>
                      ))}
                    </select>
                  </div>
                ) : (data[popOutType].entry_type === "dropdown" ? (
                  <div className='input_entry_container'>
                    <input autoComplete="on" list={data.attr} value={data.data} onChange={(e) => handleInputChange(index, e.target.value)}/> 
                    <datalist id={data.attr}>
                      {Object.values(data.options).map((opt, index) => (
                        <option value={opt[0]}>{opt[1]}</option>
                      ))}
                    </datalist>
                  </div>
                ) : (
                  data[popOutType].entry_type === "time" ? (
                    <input
                      key={index}
                      value={data.data}
                      type="datetime-local"
                      name="meeting-time"
                      min={getCurrentDateTime()}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                  ) : (
                    <input key={index} value={data.data} disabled={data[popOutType].disable} onChange={(e) => handleInputChange(index, e.target.value)}/>             
                  )
                ))}
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
