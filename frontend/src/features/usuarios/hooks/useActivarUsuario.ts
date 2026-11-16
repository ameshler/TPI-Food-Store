import { useMutation, useQueryClient } from '@tanstack/react-query'

import { activarUsuario } from '../api/usuario'

export function useActivarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (usuarioId: number) => activarUsuario(usuarioId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['usuarios'],
      })
    },
  })
}