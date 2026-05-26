import { useState, useEffect } from 'react';
import { api } from '../api';

const INSTAGRAM_USER = '@atelie_santotercoo';
const INSTAGRAM_URL = 'https://instagram.com/atelie_santotercoo';

export default function Instagram() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.customers.list().then(setCustomers).catch(() => {});
  }, []);

  const igCustomers = customers.filter(c => c.instagram);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-brown-800 font-serif mb-6">Instagram</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gold-200 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-400 via-gold-500 to-brown-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shrink-0 shadow-lg">
            A
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-xl font-bold text-brown-800 font-serif">{INSTAGRAM_USER}</h2>
            <p className="text-sm text-brown-500 mt-1">Ateliê Santo Terço</p>
            <p className="text-xs text-brown-400 mt-1">Produtos artesanais católicos • Terços personalizados • Fé e tradição</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 bg-gradient-to-r from-rose-500 to-gold-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              📸 Ver Perfil no Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Embed */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200 mb-6">
        <h2 className="text-lg font-semibold text-brown-800 font-serif mb-4">Feed do Instagram</h2>
        <div className="relative w-full overflow-hidden rounded-lg" style={{ minHeight: 480 }}>
          <iframe
            src={`https://instagram.com/atelie_santotercoo/embed`}
            className="absolute inset-0 w-full h-full border-0"
            title="Instagram Feed"
            allowTransparency
            loading="lazy"
          />
        </div>
        <p className="text-xs text-brown-400 mt-3 text-center">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">Siga @atelie_santotercoo no Instagram</a> para acompanhar as novidades
        </p>
      </div>

      {/* Customers with Instagram */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gold-200">
        <h2 className="text-lg font-semibold text-brown-800 font-serif mb-4">Clientes Vinculados ao Instagram</h2>
        {igCustomers.length === 0 ? (
          <p className="text-brown-400 text-sm text-center py-4">Nenhum cliente vinculado ao Instagram</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {igCustomers.map(c => (
              <a key={c.id} href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gold-200 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-gold-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brown-800 truncate">{c.name}</p>
                  <p className="text-xs text-rose-600">{c.instagram}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
