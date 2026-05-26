import { useState, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function OrderForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.customers.list().then(setCustomers);
    api.products.list().then(setProducts);
  }, []);

  function addItem() { setItems(prev => [...prev, { product_id: '', quantity: 1 }]); }
  function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)); }
  function setItem(i, field) { return e => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item)); }

  function calcTotal() {
    return items.reduce((sum, item) => {
      const p = products.find(pr => pr.id === parseInt(item.product_id));
      return sum + (p ? p.price * (parseInt(item.quantity) || 1) : 0);
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.some(i => !i.product_id)) return alert('Selecione um produto para cada item');
    setLoading(true);
    try {
      await api.orders.create({
        customer_id: customerId ? parseInt(customerId) : null,
        notes,
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) || 1 })),
      });
      navigate('/pedidos');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">Novo Pedido</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-brown-700">Cliente</label>
          <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Sem cliente</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-brown-700">Itens</label>
            <button type="button" onClick={addItem} className="text-sm text-gold-600 hover:underline">+ Adicionar item</button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2 items-end">
              <select className="flex-1 p-3 rounded-lg border border-gold-200 bg-offwhite" value={item.product_id} onChange={setItem(i, 'product_id')}>
                <option value="">Selecione...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>)}
              </select>
              <input className="w-20 p-3 rounded-lg border border-gold-200 bg-offwhite text-center" type="number" min="1" value={item.quantity} onChange={setItem(i, 'quantity')} />
              {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-rose-600 text-sm px-2">✕</button>}
            </div>
          ))}
        </div>

        <div className="text-right text-lg font-bold text-gold-700">Total: R$ {calcTotal().toFixed(2)}</div>

        <div>
          <label className="text-sm font-medium text-brown-700">Observações</label>
          <textarea className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-4">
          <button className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50" disabled={loading}>{loading ? 'Criando...' : 'Criar Pedido'}</button>
          <button type="button" onClick={() => navigate('/pedidos')} className="px-6 py-3 rounded-lg border border-gold-200 hover:bg-gold-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
