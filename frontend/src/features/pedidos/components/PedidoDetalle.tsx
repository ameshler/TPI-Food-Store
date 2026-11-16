import { usePedido } from '../hooks/usePedido'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'

interface PedidoDetalleProps {
  pedidoId: number
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

export function PedidoDetalle({ pedidoId }: PedidoDetalleProps) {
  const pedidoQuery = usePedido(pedidoId)

  if (pedidoQuery.isPending) {
    return (
      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (pedidoQuery.isError) {
    return (
      <div className="mt-5 border-t border-slate-200 pt-5">
        <EstadoError
          message={handleApiError(pedidoQuery.error)}
          onRetry={() => void pedidoQuery.refetch()}
        />
      </div>
    )
  }

  const pedido = pedidoQuery.data

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="mb-4 font-semibold text-slate-900">
        Productos del pedido
      </h3>

      <div className="space-y-3">
        {pedido.items.map((item, index) => (
          <div
            key={`${pedido.id}-${item.producto_id}-${index}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4"
          >
            <div>
              <p className="font-medium text-slate-800">
                {item.nombre_producto}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {item.cantidad} ×{' '}
                {formatoPrecio.format(item.precio_unitario)}
              </p>
            </div>

            <span className="font-semibold text-slate-900">
              {formatoPrecio.format(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-slate-500">Dirección de entrega</p>
          <p className="mt-1 font-medium text-slate-800">
            {pedido.direccion_entrega}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Forma de pago</p>
          <p className="mt-1 font-medium text-slate-800">
            {pedido.forma_pago === 'EFECTIVO'
              ? 'Efectivo'
              : 'Transferencia'}
          </p>
        </div>

        <div>
          <p className="text-slate-500">Fecha de creación</p>
          <p className="mt-1 font-medium text-slate-800">
            {formatoFecha.format(new Date(pedido.created_at))}
          </p>
        </div>

        {pedido.notas && (
          <div>
            <p className="text-slate-500">Notas</p>
            <p className="mt-1 font-medium text-slate-800">
              {pedido.notas}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
        <div className="text-right">
          <p className="text-sm text-slate-500">Total del pedido</p>
          <p className="text-xl font-bold text-slate-900">
            {formatoPrecio.format(pedido.total)}
          </p>
        </div>
      </div>
    </div>
  )
}