import { useState, useEffect } from 'react';
import { api } from '../api';

const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function formatAddress(c) {
  const parts = [c.address_street, c.address_number].filter(Boolean).join(', ');
  const rest = [c.address_neighborhood, c.address_city].filter(Boolean).join(' - ');
  const state = c.address_state || '';
  const full = [parts, rest].filter(Boolean).join(', ');
  return full ? `${full}${state ? `/${state}` : ''}${c.address_zipcode ? ` (CEP: ${c.address_zipcode})` : ''}` : c.address || '';
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const blankForm = { name: '', email: '', phone: '', address_street: '', address_number: '', address_neighborhood: '', address_city: '', address_state: '', address_zipcode: '', instagram: '', notes: '' };
  const [form, setForm] = useState({ ...blankForm });

  useEffect(() => { api.customers.list({ search }).then(setCustomers); }, [search]);

  function resetForm() { setForm({ ...blankForm }); setEditing(null); }

  function setField(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      await api.customers.update(editing.id, form);
    } else {
      await api.customers.create(form);
    }
    resetForm(); setShowForm(false);
    api.customers.list().then(setCustomers);
  }

  async function handleEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address_street: c.address_street || '',
      address_number: c.address_number || '',
      address_neighborhood: c.address_neighborhood || '',
      address_city: c.address_city || '',
      address_state: c.address_state || '',
      address_zipcode: c.address_zipcode || '',
      instagram: c.instagram || '',
      notes: c.notes || '',
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm('Remover este cliente?')) return;
    await api.customers.delete(id);
    setCustomers(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brown-800 font-serif">Clientes</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700">+ Novo Cliente</button>
      </div>
      <input className="w-full p-3 rounded-lg border border-gold-200 bg-white mb-4 placeholder:text-brown-300" placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md mb-6 border border-gold-200">
          <h2 className="font-semibold text-brown-700 mb-4 font-serif">{editing ? 'Editar' : 'Novo'} Cliente</h2>

          <div className="text-sm font-medium text-brown-600 mb-2">Dados Pessoais</div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Nome *" value={form.name} onChange={setField('name')} required />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Email" type="email" value={form.email} onChange={setField('email')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Telefone" value={form.phone} onChange={setField('phone')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Instagram" value={form.instagram} onChange={setField('instagram')} />
          </div>

          <div className="text-sm font-medium text-brown-600 mb-2">Endereço</div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Rua / Avenida" value={form.address_street} onChange={setField('address_street')} />
            </div>
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Número" value={form.address_number} onChange={setField('address_number')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Bairro" value={form.address_neighborhood} onChange={setField('address_neighborhood')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Cidade" value={form.address_city} onChange={setField('address_city')} />
            <select className="p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-600" value={form.address_state} onChange={setField('address_state')}>
              <option value="">UF</option>
              {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="CEP" value={form.address_zipcode} onChange={setField('address_zipcode')} />
          </div>

          <div className="col-span-3">
            <textarea className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Observações" rows={2} value={form.notes} onChange={setField('notes')} />
          </div>

          <div className="flex gap-3 mt-4">
            <button className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700">{editing ? 'Atualizar' : 'Criar'}</button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-gold-200 text-sm hover:bg-gold-50">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
        <table className="w-full">
          <thead className="bg-gold-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Nome</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Email</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Telefone</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Cidade/UF</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Instagram</th>
              <th className="text-right p-4 text-sm font-medium text-brown-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gold-50/50">
                <td className="p-4 font-medium text-brown-800">{c.name}</td>
                <td className="p-4 text-sm text-brown-600">{c.email || '-'}</td>
                <td className="p-4 text-sm text-brown-600">{c.phone || '-'}</td>
                <td className="p-4 text-sm text-brown-600">{c.address_city ? `${c.address_city}/${c.address_state || ''}` : '-'}</td>
                <td className="p-4 text-sm text-brown-600">{c.instagram ? <a href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">{c.instagram}</a> : '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(c)} className="text-gold-600 text-sm hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(c.id)} className="text-rose-600 text-sm hover:underline">Remover</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-brown-400">Nenhum cliente encontrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
