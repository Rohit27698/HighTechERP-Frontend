import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import ApiDebug from './pages/ApiDebug';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import MyOrderDetail from './pages/MyOrderDetail';
import { settings, applyTheme } from './services/api';

function App() {
  useEffect(() => {
    // Apply theme from business settings
    const loadTheme = async () => {
      try {
        const response = await settings.get();
        if (response.success && response.data.css_variables) {
          applyTheme(response.data.css_variables);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/products/:id" element={<ProductDetail/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/debug" element={<ApiDebug/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/my-orders" element={<MyOrders/>} />
        <Route path="/my-orders/:id" element={<MyOrderDetail/>} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
    </Router>
  );
}

export default App;
