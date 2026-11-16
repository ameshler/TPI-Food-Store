import { useQuery } from '@tanstack/react-query'

import { obtenerResumenPedidos } from '../api/pedido'

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: obtenerResumenPedidos,
  })
}