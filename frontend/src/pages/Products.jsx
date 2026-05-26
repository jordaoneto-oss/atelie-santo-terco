import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
};

const statusColors = {
  active: 'bg-brown-100 text-brown-700',
  inactive: 'bg-gold-100 text-gold-600',
  archived: 'bg-rose-100 text-rose-700',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.products.list(params).then(setProducts);
  }, [search, statusFilter]);

  async function handleDelete(id) {
    if (!confirm('Remover este produto?')) return;
    await api.products.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif">Produtos</h1>
        <Link to="/produtos/novo" className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700 shrink-0">+ Novo Produto</Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input className="flex-1 min-w-[200px] p-3 rounded-lg border border-gold-200 bg-white placeholder:text-brown-300 text-sm" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="p-3 rounded-lg border border-gold-200 bg-white text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
        <table className="w-full">
          <thead className="bg-gold-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Produto</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Categoria</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Preço</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Estoque</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Status</th>
              <th className="text-right p-4 text-sm font-medium text-brown-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gold-50/50">
                <td className="p-4">
                  <div className="font-medium text-brown-800">{p.name}</div>
                  <div className="text-xs text-brown-400">{p.description?.slice(0, 60)}{p.description?.length > 60 ? '...' : ''}</div>
                </td>
                <td className="p-4 text-sm"><span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-700">{p.categoria || '-'}</span></td>
                <td className="p-4 text-sm font-medium text-gold-700">R$ {Number(p.price).toFixed(2)}</td>
                <td className="p-4 text-sm text-brown-600">{p.stock}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || statusColors.active}`}>{STATUS_LABELS[p.status] || p.status}</span></td>
                <td className="p-4 text-right">
                  <Link to={`/produtos/${p.id}`} className="text-gold-600 text-sm hover:underline mr-3">Editar</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-rose-600 text-sm hover:underline">Remover</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-brown-400">Nenhum produto encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0 mr-2">
                <div className="font-medium text-brown-800 text-sm truncate">{p.name}</div>
                <div className="text-xs text-brown-400 mt-0.5 line-clamp-2">{p.description || 'Sem descrição'}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusColors[p.status] || statusColors.active}`}>{STATUS_LABELS[p.status] || p.status}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-brown-600 mb-3">
              <span className="px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium">{p.categoria || '-'}</span>
              <span className="font-medium text-gold-700">R$ {Number(p.price).toFixed(2)}</span>
              <span>Est: {p.stock}</span>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gold-100">
              <Link to={`/produtos/${p.id}`} className="flex-1 text-center text-sm text-gold-600 py-2 rounded-lg border border-gold-200 hover:bg-gold-50">Editar</Link>
              <button onClick={() => handleDelete(p.id)} className="flex-1 text-sm text-rose-600 py-2 rounded-lg border border-rose-200 hover:bg-rose-50">Remover</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-center text-brown-400 py-8">Nenhum produto encontrado</p>}
      </div>
    </div>
  );
}
