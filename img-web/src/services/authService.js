import axios from 'axios';
import API_BASE_URL from './config';

export const login = (email, password) => {
  return axios.post(`${API_BASE_URL}/db/login`, { email, password });
};

export const register = (email, password) => {
  return axios.post(`${API_BASE_URL}/db/register`, { email, password });
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
