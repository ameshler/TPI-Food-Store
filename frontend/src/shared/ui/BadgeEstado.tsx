import type { EstadoPedido } from '../../features/pedidos/types/pedido'

interface BadgeEstadoProps {
  estado: EstadoPedido
}

const estados: Record<
  EstadoPedido,
  { label: string; className: string }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-800',
  },
  EN_PREPARACION: {
    label: 'En preparación',
    className: 'bg-blue-100 text-blue-800',
  },
  ENTREGADO: {
    label: 'Entregado',
    className: 'bg-green-100 text-green-800',
  },
  CANCELADO: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800',
  },
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const configuracion = estados[estado]

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${configuracion.className}`}
    >
      {configuracion.label}
    </span>
  )
}