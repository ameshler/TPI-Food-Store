import type { Producto } from '../types/producto'
import { useCartStore } from '../../../store/cartStore'

interface ProductoCardProps {
  producto: Producto
}

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar)

  const tieneStock =
    producto.activo &&
    producto.disponible &&
    producto.stock > 0

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-100">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-slate-400">
            Sin imagen disponible
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </p>

        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          {producto.nombre}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-600">
          {producto.descripcion || 'Sin descripción disponible.'}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-slate-900">
            {formatoPrecio.format(producto.precio_base)}
          </span>

          <span
            className={`text-xs font-medium ${
              tieneStock ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {tieneStock
              ? `Stock: ${producto.stock}`
              : 'No disponible'}
          </span>
        </div>

        <button
          type="button"
          disabled={!tieneStock}
          onClick={() => agregar(producto)}
          className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {tieneStock ? 'Agregar al carrito' : 'Sin disponibilidad'}
        </button>
      </div>
    </article>
  )
}