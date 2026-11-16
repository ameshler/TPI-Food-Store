import { useMutation, useQueryClient } from '@tanstack/react-query'

import { actualizarStockProducto } from '../api/productos'
import type { ProductoStockUpdate } from '../types/producto'

interface VariablesStock {
  id: number
  payload: ProductoStockUpdate
}

export function useActualizarStockProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: VariablesStock) =>
      actualizarStockProducto(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })
}