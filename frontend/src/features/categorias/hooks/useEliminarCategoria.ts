import { useMutation, useQueryClient } from '@tanstack/react-query'

import { eliminarCategoria } from '../api/categoria'

export function useEliminarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),

    onSuccess: async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['categorias'],
            }),
            queryClient.invalidateQueries({
                queryKey: ['productos'],
            }),
        ])
    },
  })
}