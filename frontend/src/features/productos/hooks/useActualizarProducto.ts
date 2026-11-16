import { useMutation, useQueryClient } from '@tanstack/react-query'

import { actualizarProducto } from '../api/productos'
import type { ProductoUpdate } from '../types/producto'

interface VariablesActualizarProducto {
  id: number
  payload: ProductoUpdate
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: VariablesActualizarProducto) =>
      actualizarProducto(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })
}