import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
} from '../features/auth/api/auth'

import type { AuthUser } from '../features/auth/types/auth'
import { registerSessionExpiredHandler } from '../shared/api/axiosInstance'

interface AuthState {
  user: AuthUser | null
  cargando: boolean

  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearSession: () => void
}

type PersistedAuthState = Pick<AuthState, 'user'>

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(
    (set) => ({
      user: null,
      cargando: true,

      login: async (username, password) => {
        set({ cargando: true })

        try {
          await loginRequest(username, password)

          const user = await getCurrentUser()

          set({ user })
        } catch (error) {
          set({ user: null })
          throw error
        } finally {
          set({ cargando: false })
        }
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ user: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })

        try {
          const user = await getCurrentUser()

          set({ user })
        } catch {
          set({ user: null })
        } finally {
          set({ cargando: false })
        }
      },

      clearSession: () => {
        set({ user: null })
      },
    }),
    {
      name: 'food-store-auth',

      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
)

// Conecta el interceptor HTTP con el estado global de autenticación.
registerSessionExpiredHandler(() => {
  useAuthStore.getState().clearSession()
})