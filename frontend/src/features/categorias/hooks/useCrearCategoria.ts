import { useMutation, useQueryClient } from '@tanstack/react-query'

import { crearCategoria } from '../api/categoria'
import type { CategoriaCreate } from '../types/categoria'

export function useCrearCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CategoriaCreate) =>
      crearCategoria(payload),

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