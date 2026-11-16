import { useQuery } from '@tanstack/react-query'

import { listarPedidos } from '../api/pedido'
import type { PedidosFiltros } from '../types/pedido'

export function usePedidos(filtros: PedidosFiltros) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => listarPedidos(filtros),
  })
}