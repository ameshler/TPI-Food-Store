import { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePedidos } from '../hooks/usePedidos'
import { useCancelarPedido } from '../hooks/useCancelarPedido'

import { PedidoCard } from '../components/PedidoCard'

import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

const LIMITE_POR_PAGINA = 10

export function MisPedidosPage() {
  const [paginaActual, setPaginaActual] = useState(0)
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<number | null>(null)

  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const pedidosQuery = usePedidos({
    skip: paginaActual * LIMITE_POR_PAGINA,
    limit: LIMITE_POR_PAGINA,
  })

  const cancelarMutation = useCancelarPedido()

  const pedidos = pedidosQuery.data?.items ?? []
  const total = pedidosQuery.data?.total ?? 0
  const totalPaginas = Math.ceil(total / LIMITE_POR_PAGINA)

  const mostrarDetalle = (pedidoId: number) => {
    setPedidoSeleccionado((actual) =>
      actual === pedidoId ? null : pedidoId,
    )
  }

  const cancelarPedido = async (pedidoId: number) => {
    const confirmado = window.confirm(
      `¿Estás seguro de que querés cancelar el pedido #${pedidoId}?`,
    )

    if (!confirmado) {
      return
    }

    setMensaje(null)
    setErrorAccion(null)

    try {
      await cancelarMutation.mutateAsync(pedidoId)

      setMensaje(`El pedido #${pedidoId} fue cancelado correctamente.`)
    } catch (error) {
      setErrorAccion(handleApiError(error))
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Food Store
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Mis pedidos
        </h1>

        <p className="mt-3 text-slate-600">
          Consultá el estado y los detalles de tus pedidos.
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
          No se pudo cancelar el pedido: {errorAccion}
        </div>
      )}

      {pedidosQuery.isPending && (
        <div className="space-y-4" role="status">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-4 w-48" />
              <Skeleton className="mt-4 h-8 w-24" />
            </div>
          ))}

          <span className="sr-only">Cargando pedidos...</span>
        </div>
      )}

      {pedidosQuery.isError && !pedidosQuery.data && (
        <EstadoError
          message={handleApiError(pedidosQuery.error)}
          onRetry={() => void pedidosQuery.refetch()}
        />
      )}

      {!pedidosQuery.isPending &&
        !pedidosQuery.isError &&
        pedidos.length === 0 && (
          <>
            <EstadoVacio
              title="Todavía no tenés pedidos"
              description="Cuando confirmes una compra, vas a poder consultar su estado y sus detalles desde acá."
            />

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-block rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                Explorar catálogo
              </Link>
            </div>
          </>
        )}

      {pedidos.length > 0 && (
        <>
          {pedidosQuery.isFetching && (
            <p
              role="status"
              className="mb-4 text-sm text-slate-500"
            >
              Actualizando pedidos...
            </p>
          )}

          <section className="space-y-4">
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                detalleAbierto={pedidoSeleccionado === pedido.id}
                cancelando={cancelarMutation.isPending}
                onVerDetalle={mostrarDetalle}
                onCancelar={(pedidoId) => {
                  void cancelarPedido(pedidoId)
                }}
              />
            ))}
          </section>

          <div className="mt-10">
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onCambiarPagina={setPaginaActual}
              deshabilitada={pedidosQuery.isFetching}
            />
          </div>
        </>
      )}
    </main>
  )
}