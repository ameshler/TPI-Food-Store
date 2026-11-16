import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cambiarEstadoPedido } from '../api/pedido'
import type {
  CambioEstado,
} from '../types/pedido'

interface CambiarEstadoVariables {
  pedidoId: number
  cambio: CambioEstado
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pedidoId, cambio }: CambiarEstadoVariables) =>
      cambiarEstadoPedido(pedidoId, cambio),

    onSuccess: async (pedido) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['pedidos'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['pedido', pedido.id],
        }),
      ])
    },
  })
}