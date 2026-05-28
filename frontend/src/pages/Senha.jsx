import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Senha() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.auth.me().then(u => setPhone(u.phone || '')).catch(() => {});
  }, []);

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

  async function handleUpdatePhone(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const user = await api.auth.updateProfile({ phone: phone.replace(/\D/g, '') });
      setPhone(user.phone || '');
      setSuccess('Celular atualizado com sucesso!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">Configurações</h1>

        <form onSubmit={handleUpdatePhone} className="bg-white rounded-xl p-6 shadow-md border border-gold-200 space-y-4 mb-6">
          <h2 className="font-semibold text-brown-700 font-serif">Celular para Recuperação de Senha</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm border border-green-200">{success}</div>}
          <div>
            <label className="text-sm font-medium text-brown-700">Número de Celular (com DDD)</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="tel" placeholder="11999990001" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50 font-medium" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Celular'}
          </button>
        </form>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brown-800 font-serif mb-6">Alterar Senha</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md border border-gold-200 space-y-4">
          <div>
            <label className="text-sm font-medium text-brown-700">Senha Atual</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="password" value={form.current_password} onChange={e => setForm(prev => ({ ...prev, current_password: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-brown-700">Nova Senha</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="password" value={form.new_password} onChange={e => setForm(prev => ({ ...prev, new_password: e.target.value }))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-brown-700">Confirmar Nova Senha</label>
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite mt-1" type="password" value={form.confirm_password} onChange={e => setForm(prev => ({ ...prev, confirm_password: e.target.value }))} required />
          </div>

          <button className="bg-gold-600 text-white px-6 py-3 rounded-lg hover:bg-gold-700 disabled:opacity-50 font-medium" disabled={loading}>
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
