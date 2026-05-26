import { useState, useEffect } from 'react';
import { api } from '../api';

const VIEWS = [
  { key: 'ranking', label: 'Por Produto', icon: '📦' },
  { key: 'byCustomer', label: 'Por Cliente', icon: '👤' },
  { key: 'byCategory', label: 'Por Categoria', icon: '🏷️' },
];

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [draft, setDraft] = useState({ customer_id: '', categoria: '', data_inicio: '', data_fim: '' });
  const [applied, setApplied] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('ranking');

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

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const params = {};
    if (draft.customer_id) params.customer_id = draft.customer_id;
    if (draft.categoria) params.categoria = draft.categoria;
    if (draft.data_inicio) params.data_inicio = draft.data_inicio;
    if (draft.data_fim) params.data_fim = draft.data_fim;
    try {
      const result = await api.reports.sales(params);
      setData(result);
      setApplied({ ...draft });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentData = data?.[activeView] || [];

  function maxQty(arr) {
    return arr?.length ? Math.max(...arr.map(r => Number(r.total_qty || r.total_items || 0))) : 1;
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif mb-6">Relatórios de Vendas</h1>

      {/* Filters */}
      <form onSubmit={handleGenerate} className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Cliente</label>
            <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" value={draft.customer_id} onChange={e => setDraft(p => ({ ...p, customer_id: e.target.value }))}>
              <option value="">Todos os clientes</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Categoria</label>
            <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" value={draft.categoria} onChange={e => setDraft(p => ({ ...p, categoria: e.target.value }))}>
              <option value="">Todas as categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Data Início</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" type="date" value={draft.data_inicio} onChange={e => setDraft(p => ({ ...p, data_inicio: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-brown-600 mb-1 block">Data Fim</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" type="date" value={draft.data_fim} onChange={e => setDraft(p => ({ ...p, data_fim: e.target.value }))} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50 font-medium w-full sm:w-auto">
          {loading ? 'Gerando...' : '📊 Gerar Relatório'}
        </button>
      </form>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 border border-red-200 text-sm">{error}</div>}

      {!data && !loading && !error && (
        <div className="bg-white rounded-xl p-8 shadow-md border border-gold-200 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-brown-500">Selecione os filtros e clique em <strong>Gerar Relatório</strong></p>
        </div>
      )}

      {loading && <p className="text-center text-brown-400 py-8">Carregando...</p>}

      {!loading && data && (
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

          {/* View tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shrink-0 ${activeView === v.key ? 'bg-gold-600 text-white' : 'bg-white border border-gold-200 text-brown-600 hover:bg-gold-50'}`}>
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>

          {activeView === 'ranking' && <RankingView data={currentData} maxQty={maxQty} />}
          {activeView === 'byCustomer' && <CustomerView data={currentData} maxQty={maxQty} />}
          {activeView === 'byCategory' && <CategoryView data={currentData} maxQty={maxQty} />}
        </>
      )}
    </div>
  );
}

function ChartBar({ label, sublabel, value, max, revenue, index }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-brown-400 w-5 shrink-0">#{index + 1}</span>
          <span className="font-medium text-brown-800 truncate">{label}</span>
          {sublabel && <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full shrink-0">{sublabel}</span>}
        </div>
        <span className="text-brown-600 font-medium shrink-0 ml-2">{value} vendidos</span>
      </div>
      <div className="w-full bg-gold-100 rounded-full h-3 overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      {revenue !== undefined && <p className="text-xs text-brown-400 mt-0.5">R$ {Number(revenue).toFixed(2)}</p>}
    </div>
  );
}

function RankingView({ data, maxQty }) {
  const mq = maxQty(data);
  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
        <h2 className="text-lg font-semibold text-brown-800 font-serif mb-4">Ranking de Itens Mais Vendidos</h2>
        {data.length === 0 ? <p className="text-brown-400 text-center py-6">Nenhum resultado</p> : (
          <div className="space-y-3">
            {data.map((item, i) => (
              <ChartBar key={item.id} index={i} label={item.name} sublabel={item.categoria}
                value={item.total_qty} max={mq} revenue={item.total_revenue} />
            ))}
          </div>
        )}
      </div>
      <TableView headers={['#', 'Produto', 'Categoria', 'Qtd Vendida', 'Receita']}>
        {data.map((item, i) => (
          <tr key={item.id} className="hover:bg-gold-50/50">
            <td className="p-4 text-sm font-bold text-brown-400">{i + 1}</td>
            <td className="p-4 font-medium text-brown-800">{item.name}</td>
            <td className="p-4">{item.categoria && <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">{item.categoria}</span>}</td>
            <td className="p-4 text-right font-medium text-brown-800">{item.total_qty}</td>
            <td className="p-4 text-right text-sm font-medium text-gold-600">R$ {Number(item.total_revenue).toFixed(2)}</td>
          </tr>
        ))}
      </TableView>
      <MobileCards>{data.map((item, i) => (
        <MobileCard key={item.id} index={i} label={item.name} badge={item.categoria}
          value={`${item.total_qty}x`} sub={`R$ ${Number(item.total_revenue).toFixed(2)}`} max={mq} total={item.total_qty} />
      ))}</MobileCards>
    </>
  );
}

function CustomerView({ data, maxQty }) {
  const mq = maxQty(data);
  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
        <h2 className="text-lg font-semibold text-brown-800 font-serif mb-4">Vendas por Cliente</h2>
        {data.length === 0 ? <p className="text-brown-400 text-center py-6">Nenhum resultado</p> : (
          <div className="space-y-3">
            {data.map((item, i) => (
              <ChartBar key={item.id || i} index={i} label={item.name || 'Sem nome'}
                value={item.total_items} max={mq} revenue={item.total_revenue} />
            ))}
          </div>
        )}
      </div>
      <TableView headers={['#', 'Cliente', 'Pedidos', 'Itens', 'Receita']}>
        {data.map((item, i) => (
          <tr key={item.id || i} className="hover:bg-gold-50/50">
            <td className="p-4 text-sm font-bold text-brown-400">{i + 1}</td>
            <td className="p-4 font-medium text-brown-800">{item.name || 'Sem nome'}</td>
            <td className="p-4 text-right text-sm text-brown-600">{item.total_orders}</td>
            <td className="p-4 text-right font-medium text-brown-800">{item.total_items}</td>
            <td className="p-4 text-right text-sm font-medium text-gold-600">R$ {Number(item.total_revenue).toFixed(2)}</td>
          </tr>
        ))}
      </TableView>
      <MobileCards>{data.map((item, i) => (
        <MobileCard key={item.id || i} index={i} label={item.name || 'Sem nome'}
          value={`${item.total_items} itens`} sub={`R$ ${Number(item.total_revenue).toFixed(2)} · ${item.total_orders} pedidos`}
          max={mq} total={item.total_items} />
      ))}</MobileCards>
    </>
  );
}

function CategoryView({ data, maxQty }) {
  const mq = maxQty(data);
  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
        <h2 className="text-lg font-semibold text-brown-800 font-serif mb-4">Vendas por Categoria</h2>
        {data.length === 0 ? <p className="text-brown-400 text-center py-6">Nenhum resultado</p> : (
          <div className="space-y-3">
            {data.map((item, i) => (
              <ChartBar key={item.categoria || i} index={i} label={item.categoria}
                value={item.total_qty} max={mq} revenue={item.total_revenue} />
            ))}
          </div>
        )}
      </div>
      <TableView headers={['#', 'Categoria', 'Pedidos', 'Qtd Vendida', 'Receita']}>
        {data.map((item, i) => (
          <tr key={item.categoria || i} className="hover:bg-gold-50/50">
            <td className="p-4 text-sm font-bold text-brown-400">{i + 1}</td>
            <td className="p-4 font-medium text-brown-800">{item.categoria}</td>
            <td className="p-4 text-right text-sm text-brown-600">{item.total_orders}</td>
            <td className="p-4 text-right font-medium text-brown-800">{item.total_qty}</td>
            <td className="p-4 text-right text-sm font-medium text-gold-600">R$ {Number(item.total_revenue).toFixed(2)}</td>
          </tr>
        ))}
      </TableView>
      <MobileCards>{data.map((item, i) => (
        <MobileCard key={item.categoria || i} index={i} label={item.categoria}
          value={`${item.total_qty}x`} sub={`R$ ${Number(item.total_revenue).toFixed(2)} · ${item.total_orders} pedidos`}
          max={mq} total={item.total_qty} />
      ))}</MobileCards>
    </>
  );
}

/* Shared components */

function TableView({ headers, children }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
      <table className="w-full">
        <thead className="bg-gold-50">
          <tr>
            {headers.map(h => <th key={h} className="text-left p-4 text-sm font-medium text-brown-700">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gold-100">
          {isEmpty ? <tr><td colSpan={headers.length} className="p-8 text-center text-brown-400">Nenhum resultado</td></tr> : children}
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({ children }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div className="md:hidden space-y-3">
      {isEmpty ? <p className="text-center text-brown-400 py-8">Nenhum resultado</p> : children}
    </div>
  );
}

function MobileCard({ index, label, badge, value, sub, max, total }) {
  const pct = max > 0 ? (total / max) * 100 : 0;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-brown-400 shrink-0">#{index + 1}</span>
          <p className="font-medium text-brown-800 truncate">{label}</p>
          {badge && <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full shrink-0">{badge}</span>}
        </div>
        <span className="text-sm font-bold text-brown-800 shrink-0 ml-2">{value}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-brown-500 mb-2">{sub}</div>
      <div className="w-full bg-gold-100 rounded-full h-2 overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
