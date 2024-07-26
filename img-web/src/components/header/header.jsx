import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';
import './header.css';


export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div id='header_main_box' className={isMenuOpen ? 'open' : ''}>
      <div id='menu_icon_container' onClick={toggleMenu}>
        <span class="material-symbols-outlined no_select">menu</span>
      </div>
      <div id='nav_links_container' className={isMenuOpen ? 'open' : ''}>
        <Link to="/">主頁</Link>
        <Link to="/pick_up">領貨</Link>
        <Link to="/stocking">入庫</Link>
        <Link to="/picking_lists">撿貨</Link>
        
        <div class="dropdown">
          <Link to="/management">管理▼</Link>
          <div class="dropdown-content">
            <Link to="/products">商品管理</Link>
            <Link to="/groups">團購管理</Link>
            <Link to="/suppliers">供應商管理</Link>
            <Link to="/customers">客戶管理</Link>
            <Link to="/orders">訂單管理</Link>
          </div>
        </div>
        <Link to ="/analysis">數據分析</Link>
        <button id="logout_button" onClick={handleLogout}>登出</button>
      </div>
    </div>
  );
}

export default Header;