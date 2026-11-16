import { useQuery } from '@tanstack/react-query'

import { obtenerPedido } from '../api/pedido'

export function usePedido(pedidoId: number | null) {
  return useQuery({
    queryKey: ['pedido', pedidoId],

    queryFn: () => {
      if (pedidoId === null) {
        throw new Error('No se especificó un pedido')
      }

      return obtenerPedido(pedidoId)
    },

    enabled: pedidoId !== null,
  })
}