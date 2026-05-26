import { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user, token } = await api.auth.login({ email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email: resetEmail });
      setResetSent(true);
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
          <img src="/logo.jpg" alt="Ateliê Santo Terço" className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-gold-300 shadow-lg" />
          <h1 className="text-2xl font-bold" style={{ color: '#6b3a2a' }}>Ateliê Santo Terço</h1>
          <p className="text-gold-600 text-sm mt-1 font-medium">Gestão de Produtos e Vendas</p>
        </div>

        {resetMode ? (
          resetSent ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <p className="text-brown-700 font-medium mb-2">Email enviado!</p>
              <p className="text-brown-500 text-sm mb-4">Se o email <strong>{resetEmail}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(''); }} className="text-sm text-gold-600 hover:underline">Voltar ao login</button>
            </div>
          ) : (
            <form onSubmit={handleForgot}>
              <p className="text-brown-600 text-sm mb-4">Digite seu email cadastrado e enviaremos um link para redefinir sua senha.</p>
              {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-4 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="email" placeholder="Seu email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
              <button className="w-full p-3 rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #8a4f34, #c9992c)' }} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
              <button type="button" onClick={() => { setResetMode(false); setError(''); }} className="w-full text-center text-sm text-gold-600 hover:underline mt-3">Voltar ao login</button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-3 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-2 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="text-right mb-6">
              <button type="button" onClick={() => { setResetMode(true); setError(''); }} className="text-sm text-gold-600 hover:underline">Esqueci minha senha</button>
            </div>
            <button className="w-full p-3 rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #8a4f34, #c9992c)' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
