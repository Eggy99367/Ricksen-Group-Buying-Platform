import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import './login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log("handle log in...");
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/db/login`, { email, password }, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className='login_form_bg'>
      <div className='login_form_container'>
        <form className="login_form" onSubmit={handleSubmit}>
          <h2>用戶登入</h2>
          <div className='form_group'>
            <label>帳號</label>
            <input className='login' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='form_group'>
            <label>密碼</label>
            <input type="password" className='login' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="login login_button">登入</button>
          {/* <button type="button" className="login go_register_button" onClick={() => {navigate('/register');}}>註冊</button> */}
        </form>
      </div>
    </div>
  );
}

export default Login;
