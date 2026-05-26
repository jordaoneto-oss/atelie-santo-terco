import { useState, useEffect } from 'react';
import { api } from '../api';

const MARKETPLACE_INFO = {
  shopee: {
    name: 'Shopee',
    icon: '🛍️',
    color: 'bg-orange-500',
    fields: [
      { key: 'seller_id', label: 'ID do Vendedor', placeholder: 'Digite o ID do vendedor Shopee' },
      { key: 'store_name', label: 'Nome da Loja', placeholder: 'Digite o nome da sua loja' },
      { key: 'client_id', label: 'Client ID', placeholder: 'Client ID da API Shopee' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Client Secret da API Shopee' },
    ],
  },
  mercadolivre: {
    name: 'Mercado Livre',
    icon: '📱',
    color: 'bg-yellow-500',
    fields: [
      { key: 'seller_id', label: 'User ID', placeholder: 'Digite seu User ID do Mercado Livre' },
      { key: 'store_name', label: 'Nome da Loja', placeholder: 'Digite o nome da sua loja' },
      { key: 'client_id', label: 'App ID', placeholder: 'App ID da sua aplicação' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Client Secret da sua aplicação' },
    ],
  },
};

export default function Marketplaces() {
  const [integrations, setIntegrations] = useState([]);
  const [activeTab, setActiveTab] = useState('shopee');
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { api.marketplaces.list().then(setIntegrations); }, []);

  const current = integrations.find(i => i.marketplace === activeTab);
  const info = MARKETPLACE_INFO[activeTab];

  useEffect(() => {
    if (current) {
      setForm({
        seller_id: current.seller_id || '',
        store_name: current.store_name || '',
        client_id: current.client_id || '',
        client_secret: current.client_secret || '',
      });
      setEditingId(current.id);
    } else {
      setForm({ seller_id: '', store_name: '', client_id: '', client_secret: '' });
      setEditingId(null);
    }
  }, [current, activeTab]);

  function setField(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const body = { marketplace: activeTab, ...form };
    try {
      if (editingId) {
        await api.marketplaces.update(editingId, body);
      } else {
        await api.marketplaces.save(body);
      }
      const list = await api.marketplaces.list();
      setIntegrations(list);
    } catch (err) { alert(err.message); }
  }

  async function handleDisconnect(id) {
    if (!confirm(`Desconectar ${info?.name || 'esta integração'}?`)) return;
    try {
      await api.marketplaces.delete(id);
      setIntegrations(prev => prev.filter(i => i.id !== id));
    } catch (err) { alert(err.message); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">Integrações com Marketplaces</h1>
      <p className="text-brown-600 mb-6">Conecte sua loja aos principais marketplaces para gerenciar vendas centralizadamente.</p>

      <div className="flex gap-2 mb-6">
        {Object.entries(MARKETPLACE_INFO).map(([key, m]) => {
          const isConnected = integrations.some(i => i.marketplace === key);
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === key ? 'bg-gold-600 text-white' : 'bg-white border border-gold-200 text-brown-600 hover:bg-gold-50'}`}>
              <span>{m.icon}</span>
              <span>{m.name}</span>
              {isConnected && <span className="w-2 h-2 rounded-full bg-green-500 ml-1" title="Conectado" />}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gold-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${info?.color} rounded-lg flex items-center justify-center text-white text-lg`}>{info?.icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-brown-800">{info?.name}</h2>
              <p className="text-xs text-brown-500">{current ? 'Conectado' : 'Não conectado'}</p>
            </div>
          </div>
          {current && (
            <button onClick={() => handleDisconnect(current.id)} className="text-rose-600 text-sm hover:underline">Desconectar</button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {info?.fields.map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-brown-700 block mb-1">{f.label}</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder={f.placeholder} value={form[f.key] || ''} onChange={setField(f.key)} />
            </div>
          ))}
          <button className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 font-medium">
            {current ? 'Atualizar Credenciais' : 'Conectar'}
          </button>
        </form>

        {current && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">✓ Integração ativa</p>
            <p className="text-xs text-green-600 mt-1">Os produtos serão sincronizados automaticamente com o {info?.name}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
