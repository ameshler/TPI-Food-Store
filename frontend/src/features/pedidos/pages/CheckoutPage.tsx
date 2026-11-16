import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/useCrearPedido'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

import type {
  FormaPago,
  PedidoCreate,
} from '../types/pedido'

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const vaciar = useCartStore((state) => state.vaciar)

  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },

    onSubmit: async ({ value }) => {
      setError(null)

      const payload: PedidoCreate = {
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        forma_pago: value.forma_pago,
        direccion_entrega: value.direccion_entrega.trim(),
        ...(value.notas.trim()
          ? { notas: value.notas.trim() }
          : {}),
      }

      try {
        const pedido = await crearPedido.mutateAsync(payload)

        // El carrito se vacía únicamente cuando el backend
        // confirma que el pedido fue creado correctamente.
        vaciar()

        navigate('/mis-pedidos', {
          replace: true,
          state: {
            orderCreated: true,
            pedidoId: pedido.id,
          },
        })
      } catch (error) {
        setError(handleApiError(error))
      }
    },
  })

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <EstadoVacio
          title="No hay productos para confirmar"
          description="Agregá productos al carrito antes de realizar un pedido."
        />

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Ir al catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Confirmar pedido
        </h1>

        <p className="mt-2 text-slate-600">
          Completá los datos de entrega y seleccioná la forma de pago.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Datos de entrega
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-semibold">
                No pudimos crear el pedido
              </p>

              <p className="mt-1">{error}</p>
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
              name="direccion_entrega"
              validators={{
                onSubmit: ({ value }) => {
                  const direccion = value.trim()

                  if (direccion.length < 5) {
                    return 'La dirección debe tener al menos 5 caracteres'
                  }

                  if (direccion.length > 200) {
                    return 'La dirección no puede superar los 200 caracteres'
                  }

                  return undefined
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Dirección de entrega
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="street-address"
                    maxLength={200}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Calle y número"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <div className="mt-1 flex justify-between gap-2">
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors
                          .map(String)
                          .join(', ')}
                      </p>
                    ) : (
                      <span />
                    )}

                    <span className="text-xs text-slate-400">
                      {field.state.value.length}/200
                    </span>
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field
              name="forma_pago"
              validators={{
                onSubmit: ({ value }) =>
                  value === 'EFECTIVO' || value === 'TRANSFERENCIA'
                    ? undefined
                    : 'Seleccioná una forma de pago válida',
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Forma de pago
                  </label>

                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value as FormaPago)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="EFECTIVO">
                      Efectivo
                    </option>

                    <option value="TRANSFERENCIA">
                      Transferencia
                    </option>
                  </select>

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      {field.state.meta.errors
                        .map(String)
                        .join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Notas adicionales (opcional)
                  </label>

                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={4}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Indicaciones para la entrega..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
            >
              {([isSubmitting]) => (
                <button
                  type="submit"
                  disabled={isSubmitting || crearPedido.isPending}
                  className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting || crearPedido.isPending
                    ? 'Procesando pedido...'
                    : 'Confirmar pedido'}
                </button>
              )}
            </form.Subscribe>

            <Link
              to="/carrito"
              className="block text-center text-sm font-medium text-slate-600 hover:text-orange-600"
            >
              Volver al carrito
            </Link>
          </form>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Resumen de compra
          </h2>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="flex justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {item.nombre}
                  </p>

                  <p className="text-slate-500">
                    {item.cantidad} ×{' '}
                    {formatoPrecio.format(item.precio_unitario)}
                  </p>
                </div>

                <span className="font-semibold text-slate-800">
                  {formatoPrecio.format(
                    item.precio_unitario * item.cantidad,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                Total estimado
              </span>

              <span className="text-xl font-bold text-slate-900">
                {formatoPrecio.format(total)}
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              El importe definitivo se calcula en el servidor al confirmar
              el pedido, utilizando los precios vigentes.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}