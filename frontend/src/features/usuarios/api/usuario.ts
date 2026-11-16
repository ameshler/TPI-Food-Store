import axiosInstance from '../../../shared/api/axiosInstance'
import type { Usuario } from '../types/usuario'

export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await axiosInstance.get<Usuario[]>(
    '/admin/usuarios',
  )

  return response.data
}

export async function activarUsuario(
  usuarioId: number,
): Promise<Usuario> {
  const response = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${usuarioId}/activar`,
  )

  return response.data
}

export async function desactivarUsuario(
  usuarioId: number,
): Promise<Usuario> {
  const response = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${usuarioId}/desactivar`,
  )

  return response.data
}