import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  printing: 'Impressão',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors = {
  pending: 'bg-gold-100 text-gold-700',
  confirmed: 'bg-brown-100 text-brown-700',
  printing: 'bg-rose-100 text-rose-700',
  shipped: 'bg-gold-200 text-gold-800',
  delivered: 'bg-brown-200 text-brown-800',
  cancelled: 'bg-rose-200 text-rose-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { api.customers.list().then(setCustomers).catch(() => {}); }, []);

  useEffect(() => {
    const params = {};
    if (filter) params.status = filter;
    if (customerFilter) params.customer_id = customerFilter;
    if (dateFilter) {
      const d = new Date(dateFilter);
      params.data_inicio = d.toISOString().slice(0, 10);
      params.data_fim = d.toISOString().slice(0, 10);
    }
    api.orders.list(params).then(setOrders);
  }, [filter, customerFilter, dateFilter]);

  async function updateStatus(id, status) {
    await api.orders.updateStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif">Pedidos</h1>
        <Link to="/pedidos/novo" className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700 shrink-0">+ Novo Pedido</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select className="p-2.5 rounded-lg border border-gold-200 bg-white text-sm" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}>
          <option value="">Todos os clientes</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="p-2.5 rounded-lg border border-gold-200 bg-white text-sm" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <div className="flex gap-1 overflow-x-auto pb-1">
          {['', 'pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm ${filter === s ? 'bg-brown-700 text-white' : 'bg-white border border-gold-200 hover:bg-gold-50 text-brown-600'}`}>
              {s ? STATUS_LABELS[s] : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
        <table className="w-full">
          <thead className="bg-gold-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-brown-700">#</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Cliente</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Itens</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Total</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Status</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Data</th>
              <th className="text-right p-4 text-sm font-medium text-brown-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-100">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gold-50/50">
                <td className="p-4 font-medium text-brown-800">#{o.id}</td>
                <td className="p-4 text-sm text-brown-600">{o.customer?.name || '-'}</td>
                <td className="p-4 text-sm text-brown-600">{o.items?.length || 0} item(ns)</td>
                <td className="p-4 text-sm font-medium text-gold-700">R$ {Number(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[o.status]}`}>
                    {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="p-4 text-sm text-brown-500">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => updateStatus(o.id, 'cancelled')} className="text-rose-600 text-sm hover:underline">Cancelar</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-brown-400">Nenhum pedido encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-brown-800 text-sm">Pedido #{o.id}</div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[o.status]}`}>{STATUS_LABELS[o.status]}</span>
            </div>
            <div className="space-y-1 text-xs text-brown-500 mb-3">
              <div>👤 {o.customer?.name || 'Sem cliente'}</div>
              <div>📦 {o.items?.length || 0} item(ns)</div>
              <div className="font-medium text-gold-700">💰 R$ {Number(o.total).toFixed(2)}</div>
              <div>📅 {new Date(o.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gold-100">
              <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className={`flex-1 text-xs py-2 px-2 rounded-lg border border-gold-200 bg-white ${statusColors[o.status]}`}>
                {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <button onClick={() => updateStatus(o.id, 'cancelled')} className="text-xs text-rose-600 py-2 px-3 rounded-lg border border-rose-200 hover:bg-rose-50 shrink-0">Cancelar</button>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-center text-brown-400 py-8">Nenhum pedido encontrado</p>}
      </div>
    </div>
  );
}
