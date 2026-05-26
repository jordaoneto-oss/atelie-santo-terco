import { useState, useEffect } from 'react';
import { api } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', dimensions: '', weight: '', crucifixo: '', entremeio: '', contas: '', resina: false, tipo_banho: '', detalhes_memo: '', categoria: '', stock: '', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) api.products.get(id).then(p => {
      setForm({
        name: p.name, description: p.description || '', price: p.price, cost: p.cost || '',
        dimensions: p.dimensions || '', weight: p.weight || '',
        crucifixo: p.crucifixo || '', entremeio: p.entremeio || '', contas: p.contas || '',
        resina: !!p.resina, tipo_banho: p.tipo_banho || '', detalhes_memo: p.detalhes_memo || '', categoria: p.categoria || '',
        stock: p.stock || '', status: p.status,
      });
    });
  }, [id]);

  function set(field) { return e => setForm(prev => ({ ...prev, [field]: e.target.value })); }

  function setCheck(field) { return e => setForm(prev => ({ ...prev, [field]: e.target.checked })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const body = {
      ...form,
      price: parseFloat(form.price),
      cost: form.cost ? parseFloat(form.cost) : 0,
      weight: form.weight ? parseFloat(form.weight) : 0,
      stock: parseInt(form.stock) || 0,
      resina: form.resina ? 1 : 0,
    };
    try {
      if (isEdit) {
        await api.products.update(id, body);
      } else {
        await api.products.create(body);
      }
      navigate('/produtos');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">{isEdit ? 'Editar' : 'Novo'} Produto</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-200">
          <h2 className="font-medium text-brown-700 mb-4 font-serif">Informações Básicas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Nome *</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" value={form.name} onChange={set('name')} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Descrição</label>
              <textarea className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" rows={3} value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Preço (R$) *</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" type="number" step="0.01" value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Custo (R$)</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" type="number" step="0.01" value={form.cost} onChange={set('cost')} />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Dimensões</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" value={form.dimensions} onChange={set('dimensions')} placeholder="10x10x15cm" />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Peso (g)</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" type="number" value={form.weight} onChange={set('weight')} />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Estoque</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" type="number" value={form.stock} onChange={set('stock')} />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Categoria</label>
              <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-600" value={form.categoria} onChange={set('categoria')}>
                <option value="">Selecione...</option>
                <option value="Dia a Dia">Dia a Dia</option>
                <option value="Premium">Premium</option>
                <option value="Luxo">Luxo</option>
                <option value="Infantil">Infantil</option>
                <option value="Lembrancinha">Lembrancinha</option>
                <option value="Noiva">Noiva</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gold-200">
          <h2 className="font-medium text-brown-700 mb-4 font-serif">Materiais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Crucifixo</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" value={form.crucifixo} onChange={set('crucifixo')} placeholder="Ex: Cruz de São Bento" />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Entremeio</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" value={form.entremeio} onChange={set('entremeio')} placeholder="Ex: Medalha Aparecida" />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Contas</label>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" value={form.contas} onChange={set('contas')} placeholder="Ex: Azul e Branco" />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Tipo de Banho</label>
              <select className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-600" value={form.tipo_banho} onChange={set('tipo_banho')}>
                <option value="">Selecione...</option>
                <option value="Dourado">Dourado</option>
                <option value="Ouro Velho">Ouro Velho</option>
                <option value="Níquel">Níquel</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Resina</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.resina} onChange={setCheck('resina')} />
                  <div className="w-11 h-6 bg-gold-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gold-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600 relative" />
                </label>
                <span className="text-sm text-brown-700">{form.resina ? 'Sim' : 'Não'}</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-brown-700 block mb-1.5">Detalhes "Memo"</label>
              <textarea className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" rows={2} value={form.detalhes_memo} onChange={set('detalhes_memo')} placeholder="Observações sobre memo personalizado..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" onClick={() => navigate('/produtos')} className="px-6 py-3 rounded-lg border border-gold-200 hover:bg-gold-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
