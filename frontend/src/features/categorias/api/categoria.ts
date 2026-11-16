import axiosInstance from '../../../shared/api/axiosInstance'

import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria'

export async function listarCategorias(): Promise<Categoria[]> {
  const response = await axiosInstance.get<Categoria[]>('/categorias')

  return response.data
}

export async function crearCategoria(
  payload: CategoriaCreate,
): Promise<Categoria> {
  const response = await axiosInstance.post<Categoria>(
    '/categorias',
    payload,
  )

  return response.data
}

export async function actualizarCategoria(
  id: number,
  payload: CategoriaUpdate,
): Promise<Categoria> {
  const response = await axiosInstance.put<Categoria>(
    `/categorias/${id}`,
    payload,
  )

  return response.data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}