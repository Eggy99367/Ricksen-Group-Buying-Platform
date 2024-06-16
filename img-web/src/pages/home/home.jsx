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
        <div className='row_btn_container'>
          <button 
            className='home' 
            onClick={() => {navigate('/pick_up');}}
          >
            <span className="fulltext">客戶領貨</span>
            <span className="shorttext">領貨</span>
          </button>
        </div>
        <div className='row_btn_container'>
          <button 
            className='home' 
            onClick={() => {navigate('/pick_up');}}
          >
            <span className="fulltext">商品入庫</span>
            <span className="shorttext">入庫</span>
          </button>
        </div>
        <div className="row_btn_container">
          <button 
            className='home' 
            onClick={() => {navigate('/products');}}
          >
            <span className="fulltext">商品管理</span>
            <span className="shorttext">商品</span>
          </button>
          <button 
            className='home' 
            onClick={() => {navigate('/groups');}}
          >
            <span className="fulltext">團購管理</span>
            <span className="shorttext">團購</span>
          </button>
        </div>
        <div className="row_btn_container">
          <button 
            className='home' 
            onClick={() => {navigate('/suppliers');}}
          >
            <span className="fulltext">供應商管理</span>
            <span className="shorttext">供應商</span>
          </button>
          <button 
            className='home' 
            onClick={() => {navigate('/customers');}}
          >
            <span className="fulltext">客戶管理</span>
            <span className="shorttext">客戶</span>
          </button>
        </div>
        <div className="row_btn_container">
          <button 
            className='home' 
            onClick={() => {navigate('/orders');}}
          >
            <span className="fulltext">訂單管理</span>
            <span className="shorttext">訂單</span>
          </button>
          <button 
            className='home' 
            onClick={() => {navigate('/analyses');}}
          >
            <span className="fulltext">數據分析</span>
            <span className="shorttext">分析</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
