import { Fragment, useMemo, useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type {
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table'

import type {
  EstadoPedido,
  Pedido,
  PedidosFiltros,
} from '../types/pedido'

import { usePedidos } from '../hooks/usePedidos'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'

import { PedidoDetalle } from '../components/PedidoDetalle'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'

import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { handleApiError } from '../../../shared/api/handleApiError'

const TAMANO_PAGINA = 10

const estadosDisponibles: {
  value: EstadoPedido | ''
  label: string
}[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'EN_PREPARACION', label: 'En preparación' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' },
]

const siguienteEstado: Partial<Record<EstadoPedido, EstadoPedido>> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'ENTREGADO',
}

const textoSiguienteEstado: Partial<Record<EstadoPedido, string>> = {
  PENDIENTE: 'Pasar a preparación',
  EN_PREPARACION: 'Marcar como entregado',
}

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | ''>('')

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TAMANO_PAGINA,
  })

  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<number | null>(null)

  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const cambiarEstadoMutation = useCambiarEstadoPedido()

  const filtros: PedidosFiltros = {
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    ...(estadoFiltro ? { estado: estadoFiltro } : {}),
  }

  const pedidosQuery = usePedidos(filtros)

  const pedidos = pedidosQuery.data?.items ?? []
  const total = pedidosQuery.data?.total ?? 0

  const cambiarEstado = async (
    pedido: Pedido,
    nuevoEstado: EstadoPedido,
  ) => {
    if (nuevoEstado === 'CANCELADO') {
      const confirmado = window.confirm(
        `¿Estás seguro de que querés cancelar el pedido #${pedido.id}? Se restituirá el stock de sus productos.`,
      )

      if (!confirmado) {
        return
      }
    }

    const descripcion =
      nuevoEstado === 'EN_PREPARACION'
        ? 'El pedido pasó a preparación.'
        : nuevoEstado === 'ENTREGADO'
          ? 'El pedido fue marcado como entregado.'
          : 'El pedido fue cancelado.'

    setMensaje(null)
    setErrorAccion(null)

    try {
      await cambiarEstadoMutation.mutateAsync({
        pedidoId: pedido.id,
        cambio: {
          estado: nuevoEstado,
        },
      })

      setMensaje(`Pedido #${pedido.id}: ${descripcion}`)
    } catch (error) {
      setErrorAccion(handleApiError(error))
    }
  }

  const mostrarDetalle = (pedidoId: number) => {
    setPedidoSeleccionado((actual) =>
      actual === pedidoId ? null : pedidoId,
    )
  }

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Pedido',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'usuario_id',
        header: 'Cliente',
        cell: ({ row }) => (
          <span className="text-slate-600">
            Usuario #{row.original.usuario_id}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-slate-600">
            {formatoFecha.format(new Date(row.original.created_at))}
          </span>
        ),
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.forma_pago === 'EFECTIVO'
              ? 'Efectivo'
              : 'Transferencia'}
          </span>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <BadgeEstado estado={row.original.estado} />
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-semibold text-slate-800">
            {formatoPrecio.format(row.original.total)}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          const siguiente = siguienteEstado[pedido.estado]
          const puedeModificar = Boolean(siguiente)
          const esTerminal =
            pedido.estado === 'ENTREGADO' ||
            pedido.estado === 'CANCELADO'

          return (
            <div className="flex min-w-52 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => mostrarDetalle(pedido.id)}
                aria-expanded={pedidoSeleccionado === pedido.id}
                disabled={cambiarEstadoMutation.isPending}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {pedidoSeleccionado === pedido.id
                  ? 'Ocultar detalle'
                  : 'Ver detalle'}
              </button>

              {puedeModificar && siguiente && (
                <button
                  type="button"
                  disabled={cambiarEstadoMutation.isPending}
                  onClick={() => {
                    void cambiarEstado(pedido, siguiente)
                  }}
                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                >
                  {textoSiguienteEstado[pedido.estado]}
                </button>
              )}

              {!esTerminal && (
                <button
                  type="button"
                  disabled={cambiarEstadoMutation.isPending}
                  onClick={() => {
                    void cambiarEstado(pedido, 'CANCELADO')
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          )
        },
      },
    ],
    [
      pedidoSeleccionado,
      cambiarEstadoMutation.isPending,
    ],
  )

  const table = useReactTable({
    data: pedidos,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  const seleccionarEstado = (estado: EstadoPedido | '') => {
    setEstadoFiltro(estado)
    setPagination((actual) => ({
      ...actual,
      pageIndex: 0,
    }))
    setPedidoSeleccionado(null)
    setMensaje(null)
    setErrorAccion(null)
  }

  if (pedidosQuery.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de pedidos
        </h1>

        <div className="space-y-3" role="status">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}

          <span className="sr-only">
            Cargando pedidos...
          </span>
        </div>
      </main>
    )
  }

  if (pedidosQuery.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Administración de pedidos
        </h1>

        <EstadoError
          message={handleApiError(pedidosQuery.error)}
          onRetry={() => void pedidosQuery.refetch()}
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
          Gestión de pedidos
        </h1>

        <p className="mt-3 text-slate-600">
          Consultá todos los pedidos y administrá sus estados.
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
          No se pudo modificar el pedido: {errorAccion}
        </div>
      )}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="filtro-estado-pedido"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Filtrar por estado
        </label>

        <select
          id="filtro-estado-pedido"
          value={estadoFiltro}
          onChange={(event) =>
            seleccionarEstado(event.target.value as EstadoPedido | '')
          }
          className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          {estadosDisponibles.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </section>

      {pedidos.length === 0 ? (
        <EstadoVacio
          title="No hay pedidos para mostrar"
          description={
            estadoFiltro
              ? 'No existen pedidos con el estado seleccionado.'
              : 'Cuando se registren pedidos, aparecerán en este listado.'
          }
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
                  <Fragment key={row.id}>
                    <tr
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

                    {pedidoSeleccionado === row.original.id && (
                      <tr key={`detalle-${row.id}`}>
                        <td
                          colSpan={row.getVisibleCells().length}
                          className="bg-slate-50 px-5 py-4"
                        >
                          <PedidoDetalle pedidoId={row.original.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              Página {pagination.pageIndex + 1} de{' '}
              {Math.max(table.getPageCount(), 1)} · {total} pedidos
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

      {pedidosQuery.isFetching && (
        <p role="status" className="mt-4 text-sm text-slate-500">
          Actualizando pedidos...
        </p>
      )}
    </main>
  )
}