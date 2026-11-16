import { useMutation, useQueryClient } from '@tanstack/react-query'

import { crearPedido } from '../api/pedido'
import type { PedidoCreate } from '../types/pedido'

export function useCrearPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['pedidos'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['productos'],
        }),
      ])
    },
  })
}