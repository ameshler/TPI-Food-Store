import { useMutation, useQueryClient } from '@tanstack/react-query'

import { desactivarUsuario } from '../api/usuario'

export function useDesactivarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (usuarioId: number) => desactivarUsuario(usuarioId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['usuarios'],
      })
    },
  })
}