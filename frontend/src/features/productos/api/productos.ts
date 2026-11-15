import axiosInstance from '../../../shared/api/axiosInstance'

import type {
  ProductosFiltros,
  ProductosPaginados,
} from '../types/producto'

export async function listarProductos(
  filtros: ProductosFiltros,
): Promise<ProductosPaginados> {
  const params = {
    skip: filtros.skip,
    limit: filtros.limit,

    ...(filtros.search?.trim()
      ? { search: filtros.search.trim() }
      : {}),

    ...(filtros.categoria_id !== undefined
      ? { categoria_id: filtros.categoria_id }
      : {}),

    ...(filtros.disponible !== undefined
      ? { disponible: filtros.disponible }
      : {}),
  }

  const response = await axiosInstance.get<ProductosPaginados>(
    '/productos',
    { params },
  )

  return response.data
}