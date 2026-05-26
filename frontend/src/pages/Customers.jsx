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
  const [searchDraft, setSearchDraft] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const blankForm = { cpf: '', name: '', email: '', phone: '', address_street: '', address_number: '', address_neighborhood: '', address_city: '', address_state: '', address_zipcode: '', instagram: '', notes: '' };
  const [form, setForm] = useState({ ...blankForm });
  const [cpfLoading, setCpfLoading] = useState(false);

  useEffect(() => {
    api.customers.list(searchApplied ? { search: searchApplied } : {}).then(setCustomers);
  }, [searchApplied]);

  useEffect(() => { api.customers.list({}).then(setCustomers); }, []);

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
      cpf: c.cpf || '',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif">Clientes</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700 shrink-0">+ Novo Cliente</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); setSearchApplied(searchDraft); }} className="flex gap-2 mb-4">
        <input className="flex-1 p-3 rounded-lg border border-gold-200 bg-white placeholder:text-brown-300 text-sm" placeholder="Buscar clientes..." value={searchDraft} onChange={e => setSearchDraft(e.target.value)} />
        <button type="submit" className="bg-gold-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-gold-700 shrink-0">Buscar</button>
        {searchApplied && <button type="button" onClick={() => { setSearchDraft(''); setSearchApplied(''); }} className="px-4 py-3 rounded-lg border border-gold-200 text-sm hover:bg-gold-50 shrink-0">Limpar</button>}
      </form>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 sm:p-6 shadow-md mb-6 border border-gold-200">
          <h2 className="font-semibold text-brown-700 mb-4 font-serif">{editing ? 'Editar' : 'Novo'} Cliente</h2>

          <div className="text-sm font-medium text-brown-600 mb-2">Dados Pessoais</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <input className="flex-1 p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="CPF (apenas números)" value={form.cpf} onChange={async e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setForm(p => ({ ...p, cpf: v }));
                  if (v.length === 11) {
                    setCpfLoading(true);
                    try {
                      const res = await fetch(`https://www.receitaws.com.br/v1/cpf/${v}`);
                      const d = await res.json();
                      if (d.status === 'OK') { setForm(p => ({ ...p, name: d.nome || p.name })); }
                    } catch {} finally { setCpfLoading(false); }
                  }
                }} />
                {cpfLoading && <div className="w-4 h-4 rounded-full border-2 border-gold-400 border-t-transparent animate-spin shrink-0" />}
              </div>
              <p className="text-xs text-brown-400 mt-1">Preenche o nome automaticamente via API pública (ReceitaWS). E-mail e telefone não são disponibilizados por nenhuma base governamental aberta.</p>
            </div>
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Nome *" value={form.name} onChange={setField('name')} required />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Email" type="email" value={form.email} onChange={setField('email')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Telefone" value={form.phone} onChange={setField('phone')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Instagram" value={form.instagram} onChange={setField('instagram')} />
          </div>

          <div className="text-sm font-medium text-brown-600 mb-2">Endereço</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2">
                <input className="flex-1 p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="CEP" value={form.address_zipcode} onChange={async e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setForm(p => ({ ...p, address_zipcode: v }));
                  if (v.length === 8) {
                    try {
                      const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
                      const d = await res.json();
                      if (!d.erro) {
                        setForm(p => ({ ...p, address_street: d.logradouro || p.address_street, address_neighborhood: d.bairro || p.address_neighborhood, address_city: d.localidade || p.address_city, address_state: d.uf || p.address_state }));
                      }
                    } catch {}
                  }
                }} />
                {form.address_zipcode.length === 8 && <div className="w-4 h-4 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />}
              </div>
            </div>
            <div className="sm:col-span-2">
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Rua / Avenida" value={form.address_street} onChange={setField('address_street')} />
            </div>
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Número" value={form.address_number} onChange={setField('address_number')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Bairro" value={form.address_neighborhood} onChange={setField('address_neighborhood')} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Cidade" value={form.address_city} onChange={setField('address_city')} />
            <select className="p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-600 text-sm" value={form.address_state} onChange={setField('address_state')}>
              <option value="">UF</option>
              {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          <textarea className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-sm" placeholder="Observações" rows={2} value={form.notes} onChange={setField('notes')} />

          <div className="flex gap-3 mt-4">
            <button className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700">{editing ? 'Atualizar' : 'Criar'}</button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-gold-200 text-sm hover:bg-gold-50">Cancelar</button>
          </div>
        </form>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gold-200">
        <table className="w-full">
          <thead className="bg-gold-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Nome</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Email</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Telefone</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Cidade/UF</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Instagram</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Criado por</th>
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
                <td className="p-4 text-xs text-brown-500">
                  <div>{c.created_by_name || '-'}</div>
                  <div className="text-[10px] text-brown-400">{new Date(c.created_at).toLocaleString('pt-BR')}</div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(c)} className="text-gold-600 text-sm hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(c.id)} className="text-rose-600 text-sm hover:underline">Remover</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-brown-400">Nenhum cliente encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {customers.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
            <div className="font-medium text-brown-800 text-sm mb-1">{c.name}</div>
            <div className="space-y-1 text-xs text-brown-500 mb-2">
              {c.email && <div>📧 {c.email}</div>}
              {c.phone && <div>📞 {c.phone}</div>}
              {c.address_city && <div>📍 {c.address_city}/{c.address_state || ''}</div>}
              {c.instagram && <div>📷 <a href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-rose-600">{c.instagram}</a></div>}
            </div>
            <div className="text-[10px] text-brown-400 mb-3">Criado por {c.created_by_name || '-'} em {new Date(c.created_at).toLocaleString('pt-BR')}</div>
            <div className="flex gap-2 pt-2 border-t border-gold-100">
              <button onClick={() => handleEdit(c)} className="flex-1 text-sm text-gold-600 py-2 rounded-lg border border-gold-200 hover:bg-gold-50">Editar</button>
              <button onClick={() => handleDelete(c.id)} className="flex-1 text-sm text-rose-600 py-2 rounded-lg border border-rose-200 hover:bg-rose-50">Remover</button>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-center text-brown-400 py-8">Nenhum cliente encontrado</p>}
      </div>
    </div>
  );
}
