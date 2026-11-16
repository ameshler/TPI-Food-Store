import { useQuery } from '@tanstack/react-query'

import { listarUsuarios } from '../api/usuario'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: listarUsuarios,
  })
}