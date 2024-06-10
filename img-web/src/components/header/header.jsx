import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';
import './header.css';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className='header_main_box'>
      <div id='nav_links_container'>
        <Link to="/">主頁</Link>
        <Link to="/groups">團購</Link>
        <Link to="/products">商品</Link>
        <Link to="/suppliers">供應商</Link>
        <Link to="/customers">客戶</Link>
        <Link to="/orders">訂單</Link>
      </div>
      <div id='nav_btns_container'>
        <button id="logout_button" onClick={handleLogout}>登出</button>
      </div>
    </div>
  );
}

export default Header;
