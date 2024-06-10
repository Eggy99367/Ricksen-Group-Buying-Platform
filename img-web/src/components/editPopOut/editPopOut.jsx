import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';
import './editPopOut.css';

export const EditPopOut = ({dataType="", contents, close}) => {

  return (
    <div className='pop_out_bg'>
      <div className='pop_out_container'>
        <h2>編輯{dataType}</h2>
        <span class="material-symbols-outlined pop_out_close_btn" onClick={() => {close()}}>close</span>
        {contents.map((data, index) => (
          data.edit_state.visible && (
            <div className='input_row_container' key={index}>
              <div className='input_title_container'>
                <h3>{data.showed_attr_name}</h3>
              </div>
              <div className='input_entry_container'>
                <input key={index} value={data.data} disabled={data.edit_state.disable}/>
              </div>
            </div>
          )
        ))}
        <button>確認編輯</button>
      </div>
    </div>
  );
}

export default EditPopOut;
