import axiosInstance from '../../../shared/api/axiosInstance'

import type {
  Pedido,
  PedidoCreate,
} from '../types/pedido'

export async function crearPedido(
  payload: PedidoCreate,
): Promise<Pedido> {
  const response = await axiosInstance.post<Pedido>(
    '/pedidos',
    payload,
  )

  return response.data
}