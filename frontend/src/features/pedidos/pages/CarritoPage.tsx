import { Link } from 'react-router-dom'

import { useCartStore } from '../../../store/cartStore'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const quitar = useCartStore((state) => state.quitar)
  const cambiarCantidad = useCartStore(
    (state) => state.cambiarCantidad,
  )
  const vaciar = useCartStore((state) => state.vaciar)
  const total = useCartStore((state) => state.total())

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Mi carrito
        </h1>

        <EstadoVacio
          title="Tu carrito está vacío"
          description="Todavía no agregaste ningún producto. Explorá nuestro catálogo para comenzar."
        />

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            Ir al catálogo
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Mi carrito
          </h1>

          <p className="mt-2 text-slate-600">
            Revisá tus productos antes de confirmar el pedido.
          </p>
        </div>

        <button
          type="button"
          onClick={vaciar}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Vaciar carrito
        </button>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          {items.map((item) => {
            const subtotal = item.precio_unitario * item.cantidad

            return (
              <article
                key={item.producto_id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.nombre}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Precio unitario:{' '}
                      {formatoPrecio.format(item.precio_unitario)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <label
                        htmlFor={`cantidad-${item.producto_id}`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        Cantidad
                      </label>

                      <input
                        id={`cantidad-${item.producto_id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.cantidad}
                        onChange={(event) => {
                          const cantidad = Number(event.target.value)

                          if (
                            Number.isInteger(cantidad) &&
                            cantidad >= 1
                          ) {
                            cambiarCantidad(
                              item.producto_id,
                              cantidad,
                            )
                          }
                        }}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div className="min-w-28">
                      <p className="text-xs text-slate-500">
                        Subtotal
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatoPrecio.format(subtotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitar(item.producto_id)}
                      aria-label={`Quitar ${item.nombre} del carrito`}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Resumen del pedido
          </h2>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>Productos</span>

            <span>
              {items.reduce(
                (cantidad, item) => cantidad + item.cantidad,
                0,
              )}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold text-slate-900">
              Total
            </span>

            <span className="text-xl font-bold text-slate-900">
              {formatoPrecio.format(total)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-lg bg-orange-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-700"
          >
            Continuar con el pedido
          </Link>

          <Link
            to="/"
            className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-orange-600"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </main>
  )
}