import type { Pedido } from '../types/pedido'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { PedidoDetalle } from './PedidoDetalle'

interface PedidoCardProps {
  pedido: Pedido
  detalleAbierto: boolean
  cancelando: boolean
  onVerDetalle: (pedidoId: number) => void
  onCancelar: (pedidoId: number) => void
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

export function PedidoCard({
  pedido,
  detalleAbierto,
  cancelando,
  onVerDetalle,
  onCancelar,
}: PedidoCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Pedido #{pedido.id}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {formatoFecha.format(new Date(pedido.created_at))}
          </p>

          <div className="mt-3">
            <BadgeEstado estado={pedido.estado} />
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatoPrecio.format(pedido.total)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {pedido.items.length} producto(s)
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          aria-expanded={detalleAbierto}
          onClick={() => onVerDetalle(pedido.id)}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          {detalleAbierto ? 'Ocultar detalle' : 'Ver detalle'}
        </button>

        {pedido.estado === 'PENDIENTE' && (
          <button
            type="button"
            disabled={cancelando}
            onClick={() => onCancelar(pedido.id)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        )}
      </div>

      {detalleAbierto && (
        <PedidoDetalle pedidoId={pedido.id} />
      )}
    </article>
  )
}