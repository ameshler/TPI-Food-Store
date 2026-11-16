import { useMutation, useQueryClient } from '@tanstack/react-query'

import { eliminarProducto } from '../api/productos'

export function useEliminarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['productos'],
      })
    },
  })
}