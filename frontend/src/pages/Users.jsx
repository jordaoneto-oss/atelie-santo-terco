import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');

  useEffect(() => { api.users.list().then(setUsers).catch(() => {}); }, []);

  function resetForm() { setForm({ name: '', email: '', phone: '', password: '', role: 'viewer' }); setEditing(null); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        const body = { name: form.name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;
        await api.users.update(editing.id, body);
      } else {
        await api.users.create(form);
      }
      resetForm(); setShowForm(false);
      api.users.list().then(setUsers);
    } catch (err) { setError(err.message); }
  }

  async function handleEdit(u) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.role });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm('Remover este usuário?')) return;
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) { alert(err.message); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif">Usuários</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gold-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-700 shrink-0">+ Novo Usuário</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 border border-red-200 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 sm:p-6 shadow-md mb-6 border border-gold-200">
          <h2 className="font-semibold text-brown-700 mb-4 font-serif">{editing ? 'Editar' : 'Novo'} Usuário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Nome *" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Email *" type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} required />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder="Celular (com DDD)" type="tel" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
            <input className="p-3 rounded-lg border border-gold-200 bg-offwhite" placeholder={editing ? 'Nova senha (deixar vazio para manter)' : 'Senha *'} type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} required={!editing} />
            <select className="p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-600" value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="viewer">Visualizador</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
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
              <th className="text-left p-4 text-sm font-medium text-brown-700">Celular</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Função</th>
              <th className="text-left p-4 text-sm font-medium text-brown-700">Criado em</th>
              <th className="text-right p-4 text-sm font-medium text-brown-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gold-50/50">
                <td className="p-4 font-medium text-brown-800">{u.name}</td>
                <td className="p-4 text-sm text-brown-600">{u.email}</td>
                <td className="p-4 text-sm text-brown-600">{u.phone || '-'}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-gold-100 text-gold-700' : 'bg-brown-100 text-brown-600'}`}>{u.role}</span></td>
                <td className="p-4 text-sm text-brown-500">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(u)} className="text-gold-600 text-sm hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(u.id)} className="text-rose-600 text-sm hover:underline">Remover</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-brown-400">Nenhum usuário encontrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm border border-gold-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-brown-800">{u.name}</p>
                <p className="text-sm text-brown-500">{u.email}</p>
                {u.phone && <p className="text-xs text-brown-400 mt-0.5">{u.phone}</p>}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${u.role === 'admin' ? 'bg-gold-100 text-gold-700' : 'bg-brown-100 text-brown-600'}`}>{u.role}</span>
            </div>
            <p className="text-xs text-brown-400 mb-3">Criado em {new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
            <div className="flex gap-3">
              <button onClick={() => handleEdit(u)} className="text-gold-600 text-sm hover:underline">Editar</button>
              <button onClick={() => handleDelete(u.id)} className="text-rose-600 text-sm hover:underline">Remover</button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-brown-400 py-8">Nenhum usuário encontrado</p>}
      </div>
    </div>
  );
}
