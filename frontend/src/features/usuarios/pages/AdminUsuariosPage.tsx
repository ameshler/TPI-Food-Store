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

import type { Usuario } from '../types/usuario'

import { useUsuarios } from '../hooks/useUsuarios'
import { useActivarUsuario } from '../hooks/useActivarUsuario'
import { useDesactivarUsuario } from '../hooks/useDesactivarUsuario'

import { useAuthStore } from '../../../store/authStore'

import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

export function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((state) => state.user)

  const usuariosQuery = useUsuarios()
  const activarMutation = useActivarUsuario()
  const desactivarMutation = useDesactivarUsuario()

  const usuarios = usuariosQuery.data ?? []

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [usuarioProcesadoId, setUsuarioProcesadoId] =
    useState<number | null>(null)

  const procesando =
    activarMutation.isPending || desactivarMutation.isPending

  const handleActivar = useCallback(
    async (usuario: Usuario) => {
      setMensaje(null)
      setErrorAccion(null)
      setUsuarioProcesadoId(usuario.id)

      try {
        await activarMutation.mutateAsync(usuario.id)

        setMensaje(
          `El usuario "${usuario.username}" fue activado correctamente.`,
        )
      } catch (error) {
        setErrorAccion(handleApiError(error))
      } finally {
        setUsuarioProcesadoId(null)
      }
    },
    [activarMutation.mutateAsync],
  )

  const handleDesactivar = useCallback(
    async (usuario: Usuario) => {
      if (usuario.id === usuarioActual?.id) {
        return
      }

      const confirmado = window.confirm(
        `¿Estás seguro de que querés desactivar al usuario "${usuario.username}"?`,
      )

      if (!confirmado) {
        return
      }

      setMensaje(null)
      setErrorAccion(null)
      setUsuarioProcesadoId(usuario.id)

      try {
        await desactivarMutation.mutateAsync(usuario.id)

        setMensaje(
          `El usuario "${usuario.username}" fue desactivado correctamente.`,
        )
      } catch (error) {
        setErrorAccion(handleApiError(error))
      } finally {
        setUsuarioProcesadoId(null)
      }
    },
    [desactivarMutation.mutateAsync, usuarioActual?.id],
  )

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Usuario',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-800">
              {row.original.username}
            </p>

            {row.original.id === usuarioActual?.id && (
              <span className="text-xs text-orange-600">
                Sesión actual
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'full_name',
        header: 'Nombre',
        cell: ({ row }) => (
          <span className="text-slate-700">
            {row.original.full_name}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              row.original.role === 'admin'
                ? 'bg-violet-100 text-violet-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {row.original.role === 'admin'
              ? 'Administrador'
              : 'Cliente'}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              row.original.disabled
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {row.original.disabled ? 'Inactivo' : 'Activo'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const usuario = row.original
          const esUsuarioActual = usuario.id === usuarioActual?.id
          const procesandoEsteUsuario =
            usuarioProcesadoId === usuario.id

          if (esUsuarioActual) {
            return (
              <span className="text-xs text-slate-500">
                Sesión actual
              </span>
            )
          }

          return usuario.disabled ? (
            <button
              type="button"
              disabled={procesando}
              onClick={() => void handleActivar(usuario)}
              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {procesandoEsteUsuario ? 'Activando...' : 'Activar'}
            </button>
          ) : (
            <button
              type="button"
              disabled={procesando}
              onClick={() => void handleDesactivar(usuario)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {procesandoEsteUsuario ? 'Desactivando...' : 'Desactivar'}
            </button>
          )
        },
      },
    ],
    [
      usuarioActual?.id,
      usuarioProcesadoId,
      procesando,
      handleActivar,
      handleDesactivar,
    ],
  )

  const table = useReactTable({
    data: usuarios,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (usuariosQuery.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de usuarios
        </h1>

        <div className="space-y-3" role="status">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}

          <span className="sr-only">
            Cargando usuarios...
          </span>
        </div>
      </main>
    )
  }

  if (usuariosQuery.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de usuarios
        </h1>

        <EstadoError
          message={handleApiError(usuariosQuery.error)}
          onRetry={() => void usuariosQuery.refetch()}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Administración
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Usuarios
        </h1>

        <p className="mt-3 text-slate-600">
          Consultá las cuentas registradas y administrá su estado.
        </p>
      </header>

      {mensaje && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {mensaje}
        </div>
      )}

      {errorAccion && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          No se pudo completar la operación: {errorAccion}
        </div>
      )}

      {usuarios.length === 0 ? (
        <EstadoVacio
          title="No hay usuarios registrados"
          description="Los usuarios que se registren en Food Store aparecerán en este listado."
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
              {Math.max(table.getPageCount(), 1)} · {usuarios.length} usuarios
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