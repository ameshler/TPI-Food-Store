import { useQuery } from '@tanstack/react-query'

import { listarProductos } from '../api/productos'

import type { ProductosFiltros } from '../types/producto'

export function useProductos(filtros: ProductosFiltros) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
  })
}