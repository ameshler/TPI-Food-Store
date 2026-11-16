import { useCallback, useMemo, useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type {
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table'

import type { Producto } from '../types/producto'
import type { ProductoFormValues } from '../components/ProductoForm'
import type { StockProductoValues } from '../components/StockProductoForm'

import { ProductoForm } from '../components/ProductoForm'
import { StockProductoForm } from '../components/StockProductoForm'

import { useProductos } from '../hooks/useProductos'
import { useCrearProducto } from '../hooks/useCrearProducto'
import { useActualizarProducto } from '../hooks/useActualizarProducto'
import { useActualizarStockProducto } from '../hooks/useActualizarStockProducto'
import { useEliminarProducto } from '../hooks/useEliminarProducto'

import { useCategorias } from '../../categorias/hooks/useCategoria'

import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Modal } from '../../../shared/ui/Modal'

import type {
  ProductoCreate,
  ProductoUpdate,
} from '../types/producto'

type FormularioActivo = 'crear' | 'editar' | null

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function AdminProductosPage() {
  const categoriasQuery = useCategorias()

  // La API trae hasta 100 productos.
  // La paginación de la tabla se realiza localmente.
  const productosQuery = useProductos({
    skip: 0,
    limit: 100,
  })

  const crearMutation = useCrearProducto()
  const actualizarMutation = useActualizarProducto()
  const stockMutation = useActualizarStockProducto()
  const eliminarMutation = useEliminarProducto()

  const categorias = categoriasQuery.data ?? []
  const productos = productosQuery.data?.items ?? []

  const [formularioActivo, setFormularioActivo] =
    useState<FormularioActivo>(null)

  const [productoEnEdicion, setProductoEnEdicion] =
    useState<Producto | null>(null)

  const [productoParaStock, setProductoParaStock] =
    useState<Producto | null>(null)

  const [eliminandoId, setEliminandoId] =
    useState<number | null>(null)

  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const abrirCrear = () => {
    setError(null)
    setMensaje(null)
    setProductoEnEdicion(null)
    setProductoParaStock(null)
    setFormularioActivo('crear')
  }

  const abrirEditar = useCallback((producto: Producto) => {
    setError(null)
    setMensaje(null)
    setProductoEnEdicion(producto)
    setProductoParaStock(null)
    setFormularioActivo('editar')
  }, [])

  const abrirInventario = useCallback((producto: Producto) => {
    setError(null)
    setMensaje(null)
    setProductoParaStock(producto)
    setProductoEnEdicion(null)
    setFormularioActivo(null)
  }, [])

  const cerrarFormularios = () => {
    setFormularioActivo(null)
    setProductoEnEdicion(null)
    setProductoParaStock(null)
    setError(null)
  }

  const guardarProducto = async (values: ProductoFormValues) => {
  setError(null)
  setMensaje(null)

  try {
    if (formularioActivo === 'editar' && productoEnEdicion) {
      const payload: ProductoUpdate = {
        categoria_id: values.categoria_id,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        precio_base: values.precio_base,
        imagen_url: values.imagen_url || null,
      }

      await actualizarMutation.mutateAsync({
        id: productoEnEdicion.id,
        payload,
      })

      setMensaje('El producto fue actualizado correctamente.')
    } else {
      const payload: ProductoCreate = {
        categoria_id: values.categoria_id,
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        precio_base: values.precio_base,
        imagen_url: values.imagen_url || null,
        stock: values.stock,
        disponible: values.disponible,
      }

      await crearMutation.mutateAsync(payload)

      setMensaje('El producto fue creado correctamente.')
    }

    cerrarFormularios()

    setPagination((actual) => ({
      ...actual,
      pageIndex: 0,
    }))
  } catch (error) {
    setError(handleApiError(error))
  }
}

  const actualizarInventario = async (values: StockProductoValues) => {
    if (!productoParaStock) {
      return
    }

    setError(null)
    setMensaje(null)

    try {
      await stockMutation.mutateAsync({
        id: productoParaStock.id,
        payload: values,
      })

      setMensaje(
        `El inventario de "${productoParaStock.nombre}" fue actualizado correctamente.`,
      )

      cerrarFormularios()
    } catch (error) {
      setError(handleApiError(error))
    }
  }

  const eliminarProducto = useCallback(
    async (producto: Producto) => {
      const confirmado = window.confirm(
        `¿Estás seguro de que querés dar de baja el producto "${producto.nombre}"?`,
      )

      if (!confirmado) {
        return
      }

      setError(null)
      setMensaje(null)
      setEliminandoId(producto.id)

      try {
        await eliminarMutation.mutateAsync(producto.id)

        setMensaje(
          `El producto "${producto.nombre}" fue dado de baja correctamente.`,
        )

        setPagination((actual) => ({
          ...actual,
          pageIndex: 0,
        }))

        if (productoEnEdicion?.id === producto.id) {
          cerrarFormularios()
        }

        if (productoParaStock?.id === producto.id) {
          cerrarFormularios()
        }
      } catch (error) {
        setError(handleApiError(error))
      } finally {
        setEliminandoId(null)
      }
    },
    [
      eliminarMutation.mutateAsync,
      productoEnEdicion,
      productoParaStock,
    ],
  )

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Producto',
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-semibold text-slate-800">
              {row.original.nombre}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              ID: {row.original.id}
            </p>
          </div>
        ),
      },
      {
        id: 'categoria',
        header: 'Categoría',
        accessorFn: (row) => row.categoria.nombre,
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.categoria.nombre}
          </span>
        ),
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => (
          <span className="font-medium text-slate-800">
            {formatoPrecio.format(row.original.precio_base)}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span
            className={
              row.original.stock > 0
                ? 'font-medium text-slate-700'
                : 'font-semibold text-red-600'
            }
          >
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Disponibilidad',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              row.original.disponible
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.original.disponible
              ? 'Disponible'
              : 'No disponible'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const producto = row.original
          const eliminando = eliminandoId === producto.id

          return (
            <div className="flex min-w-48 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => abrirEditar(producto)}
                disabled={eliminarMutation.isPending}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => abrirInventario(producto)}
                disabled={eliminarMutation.isPending}
                className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Inventario
              </button>

              <button
                type="button"
                onClick={() => void eliminarProducto(producto)}
                disabled={eliminarMutation.isPending}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Dar de baja'}
              </button>
            </div>
          )
        },
      },
    ],
    [
      abrirEditar,
      abrirInventario,
      eliminarProducto,
      eliminarMutation.isPending,
      eliminandoId,
    ],
  )

  const table = useReactTable({
    data: productos,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const guardando =
    crearMutation.isPending || actualizarMutation.isPending

  if (productosQuery.isPending || categoriasQuery.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de productos
        </h1>

        <div className="space-y-3" role="status">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}

          <span className="sr-only">
            Cargando productos y categorías...
          </span>
        </div>
      </main>
    )
  }

  if (productosQuery.isError || categoriasQuery.isError) {
    const queryError = productosQuery.isError
      ? productosQuery.error
      : categoriasQuery.error

    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de productos
        </h1>

        <EstadoError
          message={handleApiError(queryError)}
          onRetry={() => {
            void productosQuery.refetch()
            void categoriasQuery.refetch()
          }}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Administración
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Productos
          </h1>

          <p className="mt-3 text-slate-600">
            Administrá productos, precios, stock y disponibilidad.
          </p>
        </div>

        {!formularioActivo && !productoParaStock && (
          <button
            type="button"
            onClick={abrirCrear}
            disabled={categorias.length === 0}
            className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Nuevo producto
          </button>
        )}
      </header>

      {mensaje && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {mensaje}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {categorias.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No hay categorías activas. Primero necesitás crear una categoría
          para registrar productos.
        </div>
      )}

      {/* Modal de creación o edición */}
      {formularioActivo && (
        <Modal
          title={
            formularioActivo === 'editar'
              ? 'Editar producto'
              : 'Crear producto'
          }
          description="Completá los datos del producto."
          size="xl"
          onClose={cerrarFormularios}
        >
          <ProductoForm
            key={productoEnEdicion?.id ?? 'nuevo'}
            categorias={categorias}
            initialValues={
              productoEnEdicion
                ? {
                    categoria_id: productoEnEdicion.categoria_id,
                    nombre: productoEnEdicion.nombre,
                    descripcion: productoEnEdicion.descripcion ?? '',
                    precio_base: productoEnEdicion.precio_base,
                    imagen_url: productoEnEdicion.imagen_url ?? '',
                    stock: productoEnEdicion.stock,
                    disponible: productoEnEdicion.disponible,
                  }
                : undefined
            }
            modo={formularioActivo}
            submitting={guardando}
            onSubmit={guardarProducto}
            onCancel={cerrarFormularios}
          />
        </Modal>
      )}

      {/* Modal de actualización de inventario */}
      {productoParaStock && (
        <Modal
          title="Actualizar inventario"
          description="Modificá el stock y la disponibilidad del producto."
          size="md"
          onClose={cerrarFormularios}
        >
          <StockProductoForm
            key={productoParaStock.id}
            producto={productoParaStock}
            submitting={stockMutation.isPending}
            onSubmit={actualizarInventario}
            onCancel={cerrarFormularios}
          />
        </Modal>
      )}

      {productos.length === 0 ? (
        <EstadoVacio
          title="No hay productos registrados"
          description="Creá el primer producto para incorporarlo al catálogo."
        />
      ) : (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-5 py-4 font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-5 py-4 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              Página {pagination.pageIndex + 1} de{' '}
              {Math.max(table.getPageCount(), 1)} · {productos.length} productos
              cargados
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </footer>
        </section>
      )}
    </main>
  )
}