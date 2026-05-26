import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const nav = [
  { path: '/', label: 'Dashboard', icon: '📿' },
  { path: '/produtos', label: 'Produtos', icon: '📦' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/pedidos', label: 'Pedidos', icon: '🛒' },
  { path: '/relatorios', label: 'Relatórios', icon: '📊' },
  { path: '/instagram', label: 'Instagram', icon: '📸' },
];

const adminNav = [
  { path: '/admin/usuarios', label: 'Usuários', icon: '⚙️' },
];

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function NavLinks({ mobile }) {
    return (
      <>
        {nav.map(item => (
          <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 py-3 ${mobile ? 'px-4' : 'p-3'} rounded-lg text-sm ${location.pathname === item.path ? 'bg-gold-600 text-white' : 'text-gold-200 hover:bg-brown-700/50'}`}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <>
            <div className="text-xs text-gold-500 uppercase tracking-wider mt-4 mb-2 px-3">Admin</div>
            {adminNav.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 py-3 ${mobile ? 'px-4' : 'p-3'} rounded-lg text-sm ${location.pathname === item.path ? 'bg-gold-600 text-white' : 'text-gold-200 hover:bg-brown-700/50'}`}>
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="lg:hidden bg-catholic-dark text-white flex items-center justify-between px-4 py-3 shadow-lg sticky top-0 z-30">
        <button onClick={() => setMenuOpen(true)} className="text-2xl leading-none">☰</button>
        <div className="text-center">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="" className="w-6 h-6 rounded-full object-cover border border-gold-300" />
            <div className="text-sm font-bold font-serif">Ateliê</div>
          </div>
          <div className="text-[10px] text-gold-300">{user?.name?.split(' ')[0]}</div>
        </div>
        <div className="w-7" />
      </div>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-64 bg-catholic-dark text-white flex flex-col shadow-xl h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gold-700/30">
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gold-300" />
                <div>
                  <div className="text-lg font-bold font-serif">Ateliê</div>
                  <div className="text-xs text-gold-300">{user?.name} {user?.role === 'admin' ? '(Admin)' : ''}</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-2xl leading-none text-gold-300">✕</button>
            </div>
            <nav className="flex-1 py-3"><NavLinks mobile /></nav>
            <div className="p-4 border-t border-gold-700/30 space-y-2">
              <Link to="/senha" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm text-gold-300 hover:text-white w-full">
                <span>🔑</span> Alterar Senha
              </Link>
              <button onClick={onLogout} className="flex items-center gap-3 text-sm text-gold-300 hover:text-white w-full text-left">
                <span>🚪</span> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-catholic-dark text-white flex-col shadow-lg shrink-0">
        <div className="p-5 border-b border-gold-700/30">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gold-300" />
            <div>
              <div className="text-lg font-bold font-serif">Ateliê</div>
              <div className="text-xs text-gold-300 mt-1">{user?.name} {user?.role === 'admin' ? '(Admin)' : ''}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3"><NavLinks /></nav>
        <div className="p-4 border-t border-gold-700/30 space-y-2">
          <Link to="/senha" className="flex items-center gap-3 text-sm text-gold-300 hover:text-white w-full">
            <span>🔑</span> Alterar Senha
          </Link>
          <button onClick={onLogout} className="flex items-center gap-3 text-sm text-gold-300 hover:text-white w-full text-left">
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
