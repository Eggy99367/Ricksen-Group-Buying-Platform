import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header/header"
import axios from 'axios';
import './home.css';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='page_main_box'>
      <Header />
      <div className='page_content'>
        <div className="row_btn_container">
          <button className='home' onClick={() => {navigate('/products');}}> 商品管理</button>
        </div>
        <div className="row_btn_container">
          <button className='home' onClick={() => {navigate('/groups');}}>團購管理</button>
        </div>
        <div className="row_btn_container">
          <button className='home' onClick={() => {navigate('/suppliers');}}>供應商管理</button>
          <button className='home' onClick={() => {navigate('/customers');}}>客戶管理</button>
        </div>
        <div className="row_btn_container">
          <button className='home' onClick={() => {navigate('/orders');}}>訂單管理</button>
          <button className='home' onClick={() => {navigate('/analyses');}}>數據分析</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
