import React from 'react';
import { Routes, Route } from 'react-router-dom'
import { Login, Register, Home, Suppliers, Customers, Products, NotFound } from './pages';
import PrivateRoute from './utils/PrivateRoute';
import BeforeLogIn from './utils/BeforeLogIn';
import './App.css';

function App() {
  return (
    <Routes>
      // <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      // <Route path="/login" element={<BeforeLogIn><Login /></BeforeLogIn>} />
      // <Route path="/register" element={<BeforeLogIn><Register /></BeforeLogIn>} />
      // <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
      // <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
      // <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
      // <Route path="*" element={<PrivateRoute><NotFound /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
