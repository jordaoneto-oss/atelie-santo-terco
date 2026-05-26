import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ResetarSenha() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('As senhas não conferem');
    if (password.length < 3) return setError('A senha deve ter pelo menos 3 caracteres');
    setLoading(true);
    try {
      await api.auth.resetWithToken(token, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-catholic flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-gold-300 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold" style={{ color: '#6b3a2a' }}>Redefinir Senha</h1>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-brown-700 font-medium mb-4">Senha redefinida com sucesso!</p>
            <button onClick={() => navigate('/')} className="text-sm text-gold-600 hover:underline font-medium">Ir para o login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-3 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="password" placeholder="Nova senha" value={password} onChange={e => setPassword(e.target.value)} required />
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-4 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="password" placeholder="Confirmar nova senha" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            <button className="w-full p-3 rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #8a4f34, #c9992c)' }} disabled={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
