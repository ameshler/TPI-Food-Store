import { useResumenPedidos } from '../hooks/useResumenPedido'

import { ResumenCard } from '../components/ResumenCard'

import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function AdminResumenPage() {
  const resumenQuery = useResumenPedidos()

  if (resumenQuery.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Resumen del negocio
        </h1>

        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-9 w-24" />
              <Skeleton className="mt-3 h-4 w-40" />
            </div>
          ))}

          <span className="sr-only">
            Cargando indicadores...
          </span>
        </div>
      </main>
    )
  }

  if (resumenQuery.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Resumen del negocio
        </h1>

        <EstadoError
          message={handleApiError(resumenQuery.error)}
          onRetry={() => void resumenQuery.refetch()}
        />
      </main>
    )
  }

  const resumen = resumenQuery.data

  const indicadores = [
    {
      titulo: 'Pendientes',
      valor: resumen.pendientes,
      descripcion: 'Pedidos esperando preparación',
    },
    {
      titulo: 'En preparación',
      valor: resumen.en_preparacion,
      descripcion: 'Pedidos en proceso',
    },
    {
      titulo: 'Entregados',
      valor: resumen.entregados,
      descripcion: 'Pedidos completados',
    },
    {
      titulo: 'Cancelados',
      valor: resumen.cancelados,
      descripcion: 'Pedidos cancelados',
    },
    {
      titulo: 'Pedidos de hoy',
      valor: resumen.pedidos_hoy,
      descripcion: 'Pedidos creados durante el día',
    },
    {
      titulo: 'Ingresos entregados',
      valor: formatoMoneda.format(resumen.ingresos_entregados),
      descripcion: 'Total de pedidos entregados',
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Administración
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Resumen del negocio
          </h1>

          <p className="mt-3 text-slate-600">
            Indicadores generales de Food Store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void resumenQuery.refetch()}
          disabled={resumenQuery.isFetching}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {resumenQuery.isFetching ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      <section
        aria-label="Indicadores del negocio"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {indicadores.map((indicador) => (
          <ResumenCard
            key={indicador.titulo}
            titulo={indicador.titulo}
            valor={indicador.valor}
            descripcion={indicador.descripcion}
          />
        ))}
      </section>

      {resumenQuery.isFetching && (
        <p role="status" className="mt-5 text-sm text-slate-500">
          Actualizando indicadores...
        </p>
      )}
    </main>
  )
}