import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header/header"
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
            onClick={() => {navigate('/decision');}}
          >
            <span className="fulltext">成團決議</span>
            <span className="shorttext">決議</span>
          </button>
          <button 
            className='home' 
            onClick={() => {navigate('/stocking');}}
          >
            <span className="fulltext">商品入庫</span>
            <span className="shorttext">入庫</span>
          </button>
          <button 
            className='home' 
            onClick={() => {navigate('/picking_lists');}}
          >
            <span className="fulltext">撿貨</span>
            <span className="shorttext">撿貨</span>
          </button>
        </div>
        <div className='row_btn_container'>
          <button 
            className='home' 
            onClick={() => {navigate('/management');}}
          >
            <span className="fulltext">資料管理</span>
            <span className="shorttext">管理</span>
          </button>
        </div>
        <div className='row_btn_container'>
          <button 
            className='home' 
            onClick={() => {navigate('/analysis');}}
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
