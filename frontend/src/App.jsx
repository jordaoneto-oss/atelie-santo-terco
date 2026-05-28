import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from './api';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import Instagram from './pages/Instagram';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Senha from './pages/Senha';


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.auth.me().then(u => setUser(u)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Carregando...</div>;
  if (!user) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login onLogin={setUser} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={() => { setUser(null); localStorage.clear(); }} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/produtos/novo" element={<ProductForm />} />
        <Route path="/produtos/:id" element={<ProductForm />} />
        <Route path="/clientes" element={<Customers />} />
        <Route path="/pedidos" element={<Orders />} />
        <Route path="/pedidos/novo" element={<OrderForm />} />
        <Route path="/instagram" element={<Instagram />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/admin/usuarios" element={<Users />} />
        <Route path="/senha" element={<Senha />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
