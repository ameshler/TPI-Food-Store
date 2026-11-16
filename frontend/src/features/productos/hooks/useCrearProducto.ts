import { useMutation, useQueryClient } from '@tanstack/react-query'

import { crearProducto } from '../api/productos'
import type { ProductoCreate } from '../types/producto'

export function useCrearProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProductoCreate) => crearProducto(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })
}