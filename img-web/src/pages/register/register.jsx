import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import './register.css';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/db/register`, { email, password }, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <div className='register_form_bg'>
      <div className='register_form_container'>
        <form className="register_form" onSubmit={handleSubmit}>
          <h2>用戶註冊</h2>
          <div className='form_group'>
            <label>Email</label>
            <input type="email" className='register' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='form_group'>
            <label>密碼</label>
            <input type="password" className='register' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="register register_button">註冊</button>
          <button type="button" className="register return_2_login_button" onClick={() => {navigate('/login');}}>返回登入</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
