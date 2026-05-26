import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

const statusColors = {
  active: 'bg-brown-100 text-brown-700',
  inactive: 'bg-gold-100 text-gold-600',
  archived: 'bg-rose-100 text-rose-700',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api.products.list({ search }).then(setProducts); }, [search]);

  async function handleDelete(id) {
    if (!confirm('Remover este produto?')) return;
    await api.products.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brown-800 font-serif">Produtos</h1>
        <Link to="/produtos/novo" className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700">+ Novo Produto</Link>
      </div>
      <input className="w-full p-3 rounded-lg border border-gold-200 bg-white mb-4 placeholder:text-brown-300" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
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
                <td className="p-4 text-sm font-medium text-gold-700">R$ {p.price.toFixed(2)}</td>
                <td className="p-4 text-sm text-brown-600">{p.stock}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || statusColors.active}`}>{p.status}</span></td>
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
    </div>
  );
}
