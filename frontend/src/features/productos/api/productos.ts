import axiosInstance from '../../../shared/api/axiosInstance'

import type {
  Producto,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
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

export async function crearProducto(
  payload: ProductoCreate,
): Promise<Producto> {
  const response = await axiosInstance.post<Producto>(
    '/productos',
    payload,
  )

  return response.data
}

export async function actualizarProducto(
  id: number,
  payload: ProductoUpdate,
): Promise<Producto> {
  const response = await axiosInstance.put<Producto>(
    `/productos/${id}`,
    payload,
  )

  return response.data
}

export async function actualizarStockProducto(
  id: number,
  payload: ProductoStockUpdate,
): Promise<Producto> {
  const response = await axiosInstance.patch<Producto>(
    `/productos/${id}/stock`,
    payload,
  )

  return response.data
}

export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}