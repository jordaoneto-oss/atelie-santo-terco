import { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

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
    setLoading(true);
    setError('');
    try {
      await api.auth.forgotPassword({ phone: phone.replace(/\D/g, '') });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-catholic flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-gold-300 shadow-2xl relative">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="Ateliê Santo Terço" className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-gold-300 shadow-lg" />
            <h1 className="text-2xl font-bold" style={{ color: '#6b3a2a' }}>Ateliê Santo Terço</h1>
            <p className="text-gold-600 text-sm mt-1 font-medium">Recuperar Senha</p>
          </div>

          {sent ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm border border-green-200 text-center">
              Link de redefinição enviado via SMS para o número informado.
            </div>
          ) : (
            <form onSubmit={handleForgot}>
              {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
              <p className="text-sm text-brown-600 mb-4">Informe o número de celular cadastrado para receber o link de redefinição de senha.</p>
              <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-6 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="tel" placeholder="Celular (com DDD)" value={phone} onChange={e => setPhone(e.target.value)} required />
              <button className="w-full p-3 rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #8a4f34, #c9992c)' }} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <button onClick={() => { setForgotMode(false); setError(''); setSent(false); }} className="text-sm text-gold-600 hover:underline">Voltar ao login</button>
          </div>
        </div>
      </div>
    );
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

        <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-3 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full p-3 rounded-lg border border-gold-200 bg-offwhite text-brown-800 mb-2 focus:outline-none focus:border-gold-500 placeholder:text-brown-300" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="text-right mb-6">
              <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-gold-600 hover:underline">Esqueci minha senha</button>
            </div>
            <button className="w-full p-3 rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #8a4f34, #c9992c)' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
      </div>
    </div>
  );
}
