import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { useAuthStore } from '../../../store/authStore'

interface LoginLocationState {
  from?: {
    pathname?: string
  }
  registered?: boolean
}

export function LoginPage() {
  const login = useAuthStore((state) => state.login)

  const navigate = useNavigate()
  const location = useLocation()

  const [error, setError] = useState<string | null>(null)

  const locationState = location.state as LoginLocationState | null

  const redirectTo = locationState?.from?.pathname ?? '/'

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      setError(null)

      try {
        await login(value.username.trim(), value.password)

        navigate(redirectTo, { replace: true })
      } catch (error) {
        setError(handleApiError(error))
      }
    },
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Food Store
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Iniciar sesión
          </h1>

          <p className="mt-2 text-slate-600">
            Ingresá con tu cuenta para continuar.
          </p>
        </header>

        {locationState?.registered && (
          <div className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Tu cuenta fue creada correctamente. Ya podés iniciar sesión.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          noValidate
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre de usuario es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Usuario
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p
                    key={index}
                    className="mt-1 text-sm text-red-600"
                  >
                    {String(message)}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onBlur: ({ value }) =>
                value.length === 0
                  ? 'La contraseña es obligatoria'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p
                    key={index}
                    className="mt-1 text-sm text-red-600"
                  >
                    {String(message)}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
          >
            {([isSubmitting]) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Todavía no tenés una cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Registrate
          </Link>
        </p>
      </section>
    </main>
  )
}