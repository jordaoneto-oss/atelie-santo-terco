import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ customer_id: '', categoria: '', data_inicio: '', data_fim: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.customers.list(),
      api.products.list(),
    ]).then(([customersData, productsData]) => {
      setCustomers(customersData);
      const cats = [...new Set(productsData.map(p => p.categoria).filter(Boolean))];
      setCategories(cats);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (filters.customer_id) params.customer_id = filters.customer_id;
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.data_inicio) params.data_inicio = filters.data_inicio;
    if (filters.data_fim) params.data_fim = filters.data_fim;
    api.reports.sales(params).then(setData).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [filters]);

  function setFilter(key) {
    return e => setFilters(prev => ({ ...prev, [key]: e.target.value }));
  }

  const maxQty = data?.ranking?.length ? Math.max(...data.ranking.map(r => r.total_qty)) : 1;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif mb-6">Relatórios de Vendas</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Cliente</label>
            <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" value={filters.customer_id} onChange={setFilter('customer_id')}>
              <option value="">Todos os clientes</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Categoria</label>
            <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" value={filters.categoria} onChange={setFilter('categoria')}>
              <option value="">Todas as categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Data Início</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" type="date" value={filters.data_inicio} onChange={setFilter('data_inicio')} />
          </div>
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Data Fim</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" type="date" value={filters.data_fim} onChange={setFilter('data_fim')} />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 border border-red-200 text-sm">{error}</div>}

      {/* Loading */}
      {loading && <p className="text-center text-brown-400 py-8">Carregando...</p>}

      {!loading && !error && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
              <p className="text-xs text-brown-500 uppercase tracking-wider">Pedidos</p>
              <p className="text-2xl font-bold text-brown-800 mt-1">{data.summary.total_orders}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
              <p className="text-xs text-brown-500 uppercase tracking-wider">Itens Vendidos</p>
              <p className="text-2xl font-bold text-brown-800 mt-1">{data.summary.total_items_sold}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
              <p className="text-xs text-brown-500 uppercase tracking-wider">Receita Total</p>
              <p className="text-2xl font-bold text-gold-600 mt-1">R$ {Number(data.summary.total_revenue).toFixed(2)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
            <h2 className="text-lg font-semibold text-brown-800 font-serif mb-4">Ranking de Itens Mais Vendidos</h2>
            {data.ranking.length === 0 ? (
              <p className="text-brown-400 text-center py-6">Nenhum item vendido no período</p>
            ) : (
              <div className="space-y-3">
                {data.ranking.map((item, i) => {
                  const pct = (item.total_qty / maxQty) * 100;
                  return (
                    <div key={item.id}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-brown-400 w-5 shrink-0">#{i + 1}</span>
                          <span className="font-medium text-brown-800 truncate">{item.name}</span>
                          {item.categoria && <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full shrink-0">{item.categoria}</span>}
                        </div>
                        <span className="text-brown-600 font-medium shrink-0 ml-2">{item.total_qty} vendidos</span>
                      </div>
                      <div className="w-full bg-gold-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-gold-500 to-gold-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-brown-400 mt-0.5">R$ {Number(item.total_revenue).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ranking table */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
            <table className="w-full">
              <thead className="bg-gold-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-brown-700">#</th>
                  <th className="text-left p-4 text-sm font-medium text-brown-700">Produto</th>
                  <th className="text-left p-4 text-sm font-medium text-brown-700">Categoria</th>
                  <th className="text-right p-4 text-sm font-medium text-brown-700">Qtd Vendida</th>
                  <th className="text-right p-4 text-sm font-medium text-brown-700">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {data.ranking.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gold-50/50">
                    <td className="p-4 text-sm font-bold text-brown-400">{i + 1}</td>
                    <td className="p-4 font-medium text-brown-800">{item.name}</td>
                    <td className="p-4">{item.categoria && <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">{item.categoria}</span>}</td>
                    <td className="p-4 text-right font-medium text-brown-800">{item.total_qty}</td>
                    <td className="p-4 text-right text-sm font-medium text-gold-600">R$ {Number(item.total_revenue).toFixed(2)}</td>
                  </tr>
                ))}
                {data.ranking.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-brown-400">Nenhum resultado</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.ranking.map((item, i) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-brown-400 shrink-0">#{i + 1}</span>
                    <p className="font-medium text-brown-800 truncate">{item.name}</p>
                  </div>
                  <span className="text-sm font-bold text-brown-800 shrink-0 ml-2">{item.total_qty}x</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brown-500 mb-2">
                  {item.categoria && <span className="bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full">{item.categoria}</span>}
                  <span>R$ {Number(item.total_revenue).toFixed(2)}</span>
                </div>
                <div className="w-full bg-gold-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-gold-500 to-gold-600 h-full rounded-full" style={{ width: `${(item.total_qty / maxQty) * 100}%` }} />
                </div>
              </div>
            ))}
            {data.ranking.length === 0 && <p className="text-center text-brown-400 py-8">Nenhum resultado</p>}
          </div>
        </>
      )}
    </div>
  );
}
