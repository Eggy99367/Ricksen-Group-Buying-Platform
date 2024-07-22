import React from 'react';
import './imagePreview.css';

const ImagePreview = ({ data, close }) => {
  console.log(data);
  return (
    <div className='pop_out_bg'>
      <div className='pop_out_container'>
        <span className="material-symbols-outlined pop_out_close_btn no_select" onClick={close}>close</span>
        <div className='image_container'>
          <img src={data.img} alt="Preview" className='image_preview' />
          <h2>{data.name}</h2>
          <p>{data.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
