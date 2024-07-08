import React from 'react';
import Header from "../../components/header/header"
import './notFound.css';

export const NotFound = () => {

  return (
    <div className='page_main_box'>
      <Header />
      <div className='page_content'>
        <h2 id="page_not_found">Page Not Found</h2>
      </div>
    </div>
  );
}

export default NotFound;
