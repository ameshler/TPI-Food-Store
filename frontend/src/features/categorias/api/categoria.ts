import axiosInstance from '../../../shared/api/axiosInstance'

import type { Categoria } from '../types/categoria'

export async function listarCategorias(): Promise<Categoria[]> {
  const response = await axiosInstance.get<Categoria[]>('/categorias')

  return response.data
}