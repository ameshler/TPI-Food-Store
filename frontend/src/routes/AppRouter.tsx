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
              element={
                <PlaceholderPage
                  title="Resumen administrativo"
                  description="Indicadores generales del negocio."
                />
              }
            />

            <Route
              path="admin/categorias"
              element={
                <PlaceholderPage
                  title="Administrar categorías"
                  description="Alta, modificación y baja de categorías."
                />
              }
            />

            <Route
              path="admin/productos"
              element={
                <PlaceholderPage
                  title="Administrar productos"
                  description="Gestión de productos, stock y disponibilidad."
                />
              }
            />

            <Route
              path="admin/pedidos"
              element={
                <PlaceholderPage
                  title="Administrar pedidos"
                  description="Gestión de pedidos y cambios de estado."
                />
              }
            />

            <Route
              path="admin/usuarios"
              element={
                <PlaceholderPage
                  title="Administrar usuarios"
                  description="Activación y desactivación de usuarios."
                />
              }
            />
          </Route>
        </Route>

        {/* Rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}