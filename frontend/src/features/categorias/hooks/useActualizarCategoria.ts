import { useMutation, useQueryClient } from '@tanstack/react-query'

import { actualizarCategoria } from '../api/categoria'
import type { CategoriaUpdate } from '../types/categoria'

interface ActualizarCategoriaVariables {
  id: number
  payload: CategoriaUpdate
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: ActualizarCategoriaVariables) =>
      actualizarCategoria(id, payload),

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