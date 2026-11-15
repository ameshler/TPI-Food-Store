import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'

import { registerRequest } from '../api/auth'
import type { RegisterPayload } from '../types/auth'
import { handleApiError } from '../../../shared/api/handleApiError'

export function RegisterPage() {
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },

    onSubmit: async ({ value }) => {
      setError(null)

      const payload: RegisterPayload = {
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      }

      try {
        await registerRequest(payload)

        navigate('/login', {
          replace: true,
          state: { registered: true },
        })
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
            Crear cuenta
          </h1>

          <p className="mt-2 text-slate-600">
            Registrate para comenzar a realizar tus pedidos.
          </p>
        </header>

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
          className="space-y-4"
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
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
                    {String(message)}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length === 0
                  ? 'El nombre completo es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Nombre completo
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
                    {String(message)}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length === 0
                  ? 'El correo electrónico es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
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
                value.length < 8
                  ? 'La contraseña debe tener al menos 8 caracteres'
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
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {field.state.meta.errors.map((message, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
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
                {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tenés una cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Iniciá sesión
          </Link>
        </p>
      </section>
    </main>
  )
}