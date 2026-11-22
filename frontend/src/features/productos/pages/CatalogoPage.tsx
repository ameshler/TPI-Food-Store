import { useState, type FormEvent } from 'react'

import { useCategorias } from '../../categorias/hooks/useCategoria'
import { useProductos } from '../hooks/useProductos'

import { ProductoCard } from '../components/ProductoCard'

import type { ProductosFiltros } from '../types/producto'

import { Paginacion } from '../../../shared/components/Paginacion'
import { ProductGridSkeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

const LIMITE_POR_PAGINA = 4

export function CatalogoPage() {
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [paginaActual, setPaginaActual] = useState(0)

  const categoriasQuery = useCategorias()

  const filtros: ProductosFiltros = {
    skip: paginaActual * LIMITE_POR_PAGINA,
    limit: LIMITE_POR_PAGINA,

    ...(busqueda
      ? { search: busqueda }
      : {}),

    ...(categoriaSeleccionada
      ? { categoria_id: Number(categoriaSeleccionada) }
      : {}),
  }

  const productosQuery = useProductos(filtros)

  const aplicarBusqueda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setPaginaActual(0)
    setBusqueda(textoBusqueda.trim())
  }

  const cambiarCategoria = (categoriaId: string) => {
    setPaginaActual(0)
    setCategoriaSeleccionada(categoriaId)
  }

  const limpiarFiltros = () => {
    setTextoBusqueda('')
    setBusqueda('')
    setCategoriaSeleccionada('')
    setPaginaActual(0)
  }

  const productos = productosQuery.data?.items ?? []
  const total = productosQuery.data?.total ?? 0

  const totalPaginas = Math.ceil(total / LIMITE_POR_PAGINA)

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Food Store
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Nuestro catálogo
        </h1>

        <p className="mt-3 text-slate-600">
          Explorá nuestros productos y agregá tus favoritos al carrito.
        </p>
      </header>

      {/* Búsqueda y filtros */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={aplicarBusqueda}
          className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px_auto_auto] md:items-end"
        >
          <div>
            <label
              htmlFor="buscar-producto"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Buscar productos
            </label>

            <input
              id="buscar-producto"
              type="search"
              value={textoBusqueda}
              onChange={(event) => setTextoBusqueda(event.target.value)}
              placeholder="Ejemplo: pizza, hamburguesa..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="filtro-categoria"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Categoría
            </label>

            <select
              id="filtro-categoria"
              value={categoriaSeleccionada}
              disabled={categoriasQuery.isPending}
              onChange={(event) =>
                cambiarCategoria(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
            >
              <option value="">Todas las categorías</option>

              {categoriasQuery.data?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700"
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar
          </button>
        </form>

        {categoriasQuery.isError && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-red-700">
            <span>
              No se pudieron cargar las categorías: {handleApiError(categoriasQuery.error)}
            </span>

            <button
              type="button"
              onClick={() => void categoriasQuery.refetch()}
              className="font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}
      </section>

      {/* Encabezado de resultados */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Productos
        </h2>

        {!productosQuery.isPending && productosQuery.data && (
          <span className="text-sm text-slate-500">
            {total} resultado{total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* Estado de carga */}
      {productosQuery.isPending && <ProductGridSkeleton />}

      {/* Estado de error */}
      {productosQuery.isError && !productosQuery.data && (
        <EstadoError
          message={handleApiError(productosQuery.error)}
          onRetry={() => void productosQuery.refetch()}
        />
      )}

      {/* Resultados */}
      {!productosQuery.isPending &&
        !productosQuery.isError &&
        productos.length > 0 && (
          <>
            {productosQuery.isFetching && (
              <p
                role="status"
                className="mb-3 text-sm text-slate-500"
              >
                Actualizando resultados...
              </p>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productos.map((producto) => (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                />
              ))}
            </div>

            <div className="mt-10">
              <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onCambiarPagina={setPaginaActual}
                deshabilitada={productosQuery.isFetching}
              />
            </div>
          </>
        )}

      {/* Estado vacío */}
      {!productosQuery.isPending &&
        !productosQuery.isError &&
        productos.length === 0 && (
          <EstadoVacio
            title="No encontramos productos"
            description="Probá modificar la búsqueda o seleccionar otra categoría."
          />
        )}
    </main>
  )
}