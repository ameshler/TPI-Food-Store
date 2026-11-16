import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'

import { MainLayout } from '../shared/layout/MainLayout'
import { PlaceholderPage } from '../shared/components/PlaceholderPage'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'

import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantallas públicas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Aplicación principal */}
        <Route element={<MainLayout />}>
          <Route index element={<CatalogoPage />} />

          <Route path="carrito" element={<CarritoPage />} />

          <Route
            path="unauthorized"
            element={
              <PlaceholderPage
                title="Acceso no autorizado"
                description="No tenés permisos para acceder a esta pantalla."
              />
            }
          />

          {/* Rutas que requieren sesión */}
          <Route element={<ProtectedRoute />}>
          
            <Route path="checkout" element={<CheckoutPage />} />
            
            <Route path="mis-pedidos" element={<MisPedidosPage />} />

          </Route>

          {/* Rutas exclusivas del administrador */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route
              path="admin/resumen"
              element={<AdminResumenPage />}
            />

            <Route
              path="admin/categorias"
              element={<AdminCategoriasPage />}
            />

            <Route
              path="admin/productos"
              element={<AdminProductosPage />}
            />

            <Route
              path="admin/pedidos"
              element={<AdminPedidosPage />}
            />

            <Route
              path="admin/usuarios"
              element={<AdminUsuariosPage />}
            />
          </Route>
        </Route>

        {/* Rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}