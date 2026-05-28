import { useState } from 'react';
import { api } from '../api';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('Senhas não conferem');
    if (newPassword.length < 3) return setError('Senha deve ter pelo menos 3 caracteres');
    try {
      await api.auth.resetWithToken({ token, new_password: newPassword });
      setSuccess('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-catholic flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-gold-300 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#6b3a2a' }}>Ateliê Santo Terço</h1>
          <p className="text-gold-600 text-sm mt-1 font-medium">Redefinir Senha</p>
        </div>

        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm border border-green-200 text-center">{success}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-3 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={3} />
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-6 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={3} />
            <button className="w-full p-3 rounded-lg text-white font-semibold" style={{ background: 'linear-gradient(135deg, #8a4f34, #c9992c)' }}>Redefinir Senha</button>
          </form>
        )}
      </div>
    </div>
  );
}
