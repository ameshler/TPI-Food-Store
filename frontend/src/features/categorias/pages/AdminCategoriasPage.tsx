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

import type { Categoria } from '../types/categoria'
import type { CategoriaFormValues } from '../components/CategoriaForm'

import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias } from '../hooks/useCategoria'
import { useCrearCategoria } from '../hooks/useCrearCategoria'
import { useActualizarCategoria } from '../hooks/useActualizarCategoria'
import { useEliminarCategoria } from '../hooks/useEliminarCategoria'

import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Modal } from '../../../shared/ui/Modal'

export function AdminCategoriasPage() {
  const categoriasQuery = useCategorias()

  const crearMutation = useCrearCategoria()
  const actualizarMutation = useActualizarCategoria()
  const eliminarMutation = useEliminarCategoria()

  const [categoriaEnEdicion, setCategoriaEnEdicion] =
    useState<Categoria | null>(null)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const categorias = categoriasQuery.data ?? []

  const handleEditar = useCallback((categoria: Categoria) => {
    setError(null)
    setMensaje(null)
    setCategoriaEnEdicion(categoria)
    setMostrarFormulario(true)
  }, [])

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false)
    setCategoriaEnEdicion(null)
    setError(null)
  }

  const handleNuevaCategoria = () => {
    setCategoriaEnEdicion(null)
    setError(null)
    setMensaje(null)
    setMostrarFormulario(true)
  }

  const handleGuardar = async (values: CategoriaFormValues) => {
    setError(null)
    setMensaje(null)

    const descripcion = values.descripcion.trim()

    try {
      if (categoriaEnEdicion) {
        await actualizarMutation.mutateAsync({
          id: categoriaEnEdicion.id,
          payload: {
            nombre: values.nombre,
            descripcion: descripcion || null,
          },
        })

        setMensaje('La categoría fue actualizada correctamente.')
      } else {
        await crearMutation.mutateAsync({
          nombre: values.nombre,
          ...(descripcion ? { descripcion } : {}),
        })

        setMensaje('La categoría fue creada correctamente.')
      }

      setMostrarFormulario(false)
      setCategoriaEnEdicion(null)

      setPagination((actual) => ({
        ...actual,
        pageIndex: 0,
      }))
    } catch (error) {
      setError(handleApiError(error))
      throw error
    }
  }

  const handleEliminar = useCallback(
    async (categoria: Categoria) => {
      const confirmado = window.confirm(
        `¿Estás seguro de que querés dar de baja la categoría "${categoria.nombre}"?`,
      )

      if (!confirmado) {
        return
      }

      setError(null)
      setMensaje(null)
      setEliminandoId(categoria.id)

      try {
        await eliminarMutation.mutateAsync(categoria.id)

        setMensaje(
          `La categoría "${categoria.nombre}" fue dada de baja correctamente.`,
        )

        setPagination((actual) => ({
          ...actual,
          pageIndex: 0,
        }))

        if (categoriaEnEdicion?.id === categoria.id) {
          setMostrarFormulario(false)
          setCategoriaEnEdicion(null)
        }
      } catch (error) {
        setError(handleApiError(error))
      } finally {
        setEliminandoId(null)
      }
    },
    [eliminarMutation.mutateAsync, categoriaEnEdicion],
  )

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            {row.original.nombre}
          </span>
        ),
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.descripcion || 'Sin descripción'}
          </span>
        ),
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="text-slate-500">
            {row.original.id}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const categoria = row.original
          const eliminando = eliminandoId === categoria.id

          return (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleEditar(categoria)}
                disabled={eliminarMutation.isPending}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => void handleEliminar(categoria)}
                disabled={eliminarMutation.isPending}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Dar de baja'}
              </button>
            </div>
          )
        },
      },
    ],
    [
      handleEditar,
      handleEliminar,
      eliminandoId,
      eliminarMutation.isPending,
    ],
  )

  const table = useReactTable({
    data: categorias,
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

  if (categoriasQuery.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de categorías
        </h1>

        <div className="space-y-3" role="status">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}

          <span className="sr-only">
            Cargando categorías...
          </span>
        </div>
      </main>
    )
  }

  if (categoriasQuery.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de categorías
        </h1>

        <EstadoError
          message={handleApiError(categoriasQuery.error)}
          onRetry={() => void categoriasQuery.refetch()}
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
            Categorías
          </h1>

          <p className="mt-3 text-slate-600">
            Creá, modificá y administrá las categorías del catálogo.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            onClick={handleNuevaCategoria}
            className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Nueva categoría
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

      {mostrarFormulario && (
        <Modal
          title={
            categoriaEnEdicion
              ? 'Editar categoría'
              : 'Crear categoría'
          }
          description="Completá los datos de la categoría."
          size="md"
          onClose={handleCancelarFormulario}
        >
          <CategoriaForm
            key={categoriaEnEdicion?.id ?? 'nueva'}
            initialValues={
              categoriaEnEdicion
                ? {
                    nombre: categoriaEnEdicion.nombre,
                    descripcion: categoriaEnEdicion.descripcion ?? '',
                  }
                : undefined
            }
            submitting={guardando}
            submitLabel={
              categoriaEnEdicion
                ? 'Guardar cambios'
                : 'Crear categoría'
            }
            onSubmit={handleGuardar}
            onCancel={handleCancelarFormulario}
          />
        </Modal>
      )}

      {categorias.length === 0 ? (
        <EstadoVacio
          title="No hay categorías registradas"
          description="Creá la primera categoría para organizar los productos del catálogo."
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
                        className="px-5 py-4"
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
              {Math.max(table.getPageCount(), 1)} · {categorias.length}{' '}
              categorías
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

      <p className="mt-5 text-sm text-slate-500">
        La baja lógica de una categoría no desactiva sus productos asociados.
      </p>
    </main>
  )
}