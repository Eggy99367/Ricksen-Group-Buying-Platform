import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header/header"
import axios from 'axios';
import './notFound.css';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div clclassNameass='page_main_box'>
      <Header />
      <div className='page_content'>
        <h2 id="page_not_found">Page Not Found</h2>
      </div>
    </div>
  );
}

export default NotFound;
