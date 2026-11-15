import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'

export function Navbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // El store limpia la sesión local incluso si falla la petición.
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${
      isActive
        ? 'text-orange-600'
        : 'text-slate-600 hover:text-orange-600'
    }`

  return (
    <header className="relative z-10 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
        <span className="text-orange-600">Food</span> Store
      </Link>

      <nav
        aria-label="Navegación principal"
        className="flex flex-wrap items-center gap-5"
      >
        <NavLink to="/" end className={navLinkClass}>
          Catálogo
        </NavLink>

        <NavLink to="/carrito" className={navLinkClass}>
          Carrito
        </NavLink>

        {user && (
          <NavLink to="/mis-pedidos" className={navLinkClass}>
            Mis pedidos
          </NavLink>
        )}

        {user?.role === 'admin' && (
          <NavLink to="/admin/resumen" className={navLinkClass}>
            Panel administrador
          </NavLink>
        )}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        {user ? (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user.full_name}
              </p>

              <p className="text-xs text-slate-500">
                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-orange-600"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Crear cuenta
            </Link>
          </>
        )}
      </div>
    </header>
  )
}