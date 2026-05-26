import { useState } from 'react';
import { api } from '../api';

export default function Senha() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.new_password !== form.confirm_password) {
      return setError('As novas senhas não conferem');
    }
    if (form.new_password.length < 3) {
      return setError('A nova senha deve ter pelo menos 3 caracteres');
    }
    setLoading(true);
    try {
      await api.auth.resetPassword({ current_password: form.current_password, new_password: form.new_password });
      setSuccess('Senha alterada com sucesso!');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function setField(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">Alterar Senha</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md border border-gold-200 space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm border border-green-200">{success}</div>}

        <div>
          <label className="text-sm font-medium text-brown-700">Senha Atual</label>
          <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="password" value={form.current_password} onChange={setField('current_password')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-brown-700">Nova Senha</label>
          <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="password" value={form.new_password} onChange={setField('new_password')} required />
        </div>
        <div>
          <label className="text-sm font-medium text-brown-700">Confirmar Nova Senha</label>
          <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="password" value={form.confirm_password} onChange={setField('confirm_password')} required />
        </div>

        <button className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50 font-medium" disabled={loading}>
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}
