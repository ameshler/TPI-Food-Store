import axiosInstance from '../../../shared/api/axiosInstance'

import type {
  Pedido,
  PedidoCreate,
  PedidosFiltros,
  PedidosPaginados,
  ResumenPedidos,
  CambioEstado,
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

export async function listarPedidos(
  filtros: PedidosFiltros,
): Promise<PedidosPaginados> {
  const response = await axiosInstance.get<PedidosPaginados>(
    '/pedidos',
    {
      params: filtros,
    },
  )

  return response.data
}

export async function obtenerPedido(
  pedidoId: number,
): Promise<Pedido> {
  const response = await axiosInstance.get<Pedido>(
    `/pedidos/${pedidoId}`,
  )

  return response.data
}

export async function cancelarPedido(
  pedidoId: number,
): Promise<Pedido> {
  const response = await axiosInstance.patch<Pedido>(
    `/pedidos/${pedidoId}/cancelar`,
  )

  return response.data
}

export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const response = await axiosInstance.get<ResumenPedidos>(
    '/pedidos/resumen',
  )

  return response.data
}

export async function cambiarEstadoPedido(
  pedidoId: number,
  estado: CambioEstado,
): Promise<Pedido> {
  const response = await axiosInstance.patch<Pedido>(
    `/pedidos/${pedidoId}/estado`,
    estado,
  )

  return response.data
}