import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelarPedido } from '../api/pedido'

export function useCancelarPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pedidoId: number) => cancelarPedido(pedidoId),

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