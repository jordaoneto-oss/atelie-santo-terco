import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.orders.summary().then(setStats).catch(() => setStats({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0, pendingOrders: 0 }));
    api.orders.list({ status: 'pending' }).then(setOrders).catch(() => setOrders([]));
  }, []);

  if (!stats) return <p className="text-gray-500">Carregando...</p>;

  const cards = [
    { label: 'Pedidos', value: stats.totalOrders, color: 'bg-brown-700', icon: '📿' },
    { label: 'Receita', value: `R$ ${stats.totalRevenue?.toFixed(2)}`, color: 'bg-gold-600', icon: '💰' },
    { label: 'Produtos', value: stats.totalProducts, color: 'bg-rose-500', icon: '📦' },
    { label: 'Clientes', value: stats.totalCustomers, color: 'bg-brown-500', icon: '👥' },
    { label: 'Pendentes', value: stats.pendingOrders, color: 'bg-rose-600', icon: '⏳' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">Dashboard</h1>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-5 text-white shadow-md`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-200">
          <h2 className="font-semibold text-brown-700 mb-4 font-serif">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/produtos/novo" className="p-4 bg-gold-50 rounded-xl text-center hover:bg-gold-100 border border-gold-200">
              <div className="text-2xl mb-1">➕</div>
              <div className="text-sm font-medium text-brown-700">Novo Produto</div>
            </Link>
            <Link to="/pedidos/novo" className="p-4 bg-rose-50 rounded-xl text-center hover:bg-rose-100 border border-rose-200">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-sm font-medium text-rose-700">Novo Pedido</div>
            </Link>
            <Link to="/clientes" className="p-4 bg-brown-50 rounded-xl text-center hover:bg-brown-100 border border-brown-200">
              <div className="text-2xl mb-1">👤</div>
              <div className="text-sm font-medium text-brown-700">Novo Cliente</div>
            </Link>
            <Link to="/produtos" className="p-4 bg-gold-50 rounded-xl text-center hover:bg-gold-100 border border-gold-200">
              <div className="text-2xl mb-1">📋</div>
              <div className="text-sm font-medium text-brown-700">Ver Produtos</div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-200">
          <h2 className="font-semibold text-brown-700 mb-4 font-serif">Pedidos Pendentes</h2>
          {orders.length === 0 ? (
            <p className="text-brown-400 text-sm">Nenhum pedido pendente</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="flex justify-between items-center p-3 bg-offwhite rounded-lg border border-gold-100">
                  <div>
                    <div className="text-sm font-medium text-brown-800">Pedido #{o.id}</div>
                    <div className="text-xs text-brown-500">{o.customer?.name || 'Sem cliente'}</div>
                  </div>
                  <div className="text-sm font-semibold text-gold-700">R$ {o.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          {orders.length > 0 && <Link to="/pedidos" className="text-sm text-gold-600 hover:text-gold-700 mt-3 inline-block font-medium">Ver todos →</Link>}
        </div>
      </div>
    </div>
  );
}
