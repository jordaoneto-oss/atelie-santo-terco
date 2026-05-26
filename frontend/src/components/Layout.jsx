import { Outlet, Link, useLocation } from 'react-router-dom';

const nav = [
  { path: '/', label: 'Dashboard', icon: '📿' },
  { path: '/produtos', label: 'Produtos', icon: '📦' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/pedidos', label: 'Pedidos', icon: '🛒' },
  { path: '/marketplaces', label: 'Marketplaces', icon: '🔗' },
];

const adminNav = [
  { path: '/admin/usuarios', label: 'Usuários', icon: '⚙️' },
];

export default function Layout({ user, onLogout }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-offwhite flex">
      <aside className="w-60 bg-catholic-dark text-white flex flex-col shadow-lg">
        <div className="p-5 border-b border-gold-700/30">
          <div className="text-lg font-bold font-serif">🙏 Ateliê</div>
          <div className="text-xs text-gold-300 mt-1">{user?.name} {user?.role === 'admin' ? '(Admin)' : ''}</div>
        </div>
        <nav className="flex-1 p-3">
          {nav.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg mb-1 text-sm ${location.pathname === item.path ? 'bg-gold-600 text-white' : 'text-gold-200 hover:bg-brown-700/50'}`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <>
              <div className="text-xs text-gold-500 uppercase tracking-wider mt-4 mb-2 px-3">Admin</div>
              {adminNav.map(item => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg mb-1 text-sm ${location.pathname === item.path ? 'bg-gold-600 text-white' : 'text-gold-200 hover:bg-brown-700/50'}`}>
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
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
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
