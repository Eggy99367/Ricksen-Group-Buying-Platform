import React from 'react';
import './imagePreview.css';

const ImagePreview = ({ imageUrl, close }) => {
  return (
    <div className='pop_out_bg'>
      <div className='pop_out_container'>
        <span className="material-symbols-outlined pop_out_close_btn no_select" onClick={close}>close</span>
        <div className='image_container'>
          <img src={imageUrl} alt="Preview" className='image_preview' />
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
