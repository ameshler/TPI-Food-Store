from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)


def get_pedido_service() -> PedidoService:
    """
    Construye el servicio de pedidos.
    """
    return PedidoService(PedidoUnitOfWork())


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    datos: PedidoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    pedido_service: PedidoService = Depends(get_pedido_service),
):
    """
    Crea un pedido para el usuario autenticado.
    """

    try:
        return pedido_service.crear_pedido(
            datos=datos,
            usuario_id=current_user.id,
        )

    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except (
        StockInsuficiente,
        ProductoNoDisponible,
        ProductoRepetido,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = Query(default=None),
    current_user: Usuario = Depends(get_current_active_user),
    pedido_service: PedidoService = Depends(get_pedido_service),
):
    """
    Lista los pedidos propios del cliente o todos los del administrador.
    """

    return pedido_service.listar_pedidos(
        usuario_id=current_user.id,
        rol=current_user.role,
        skip=skip,
        limit=limit,
        estado=estado,
    )


# IMPORTANTE:
# Este endpoint se declara antes de /{pedido_id}
# para que "resumen" no sea interpretado como un ID.
@router.get("/resumen", response_model=ResumenPedidos)
def obtener_resumen(
    current_user: Usuario = Depends(require_role(["admin"])),
    pedido_service: PedidoService = Depends(get_pedido_service),
):
    """
    Devuelve los indicadores del panel administrativo.
    """
    return pedido_service.obtener_resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    pedido_service: PedidoService = Depends(get_pedido_service),
):
    """
    Consulta el detalle de un pedido propio o de cualquier pedido si es admin.
    """

    try:
        return pedido_service.obtener_pedido(
            pedido_id=pedido_id,
            usuario_id=current_user.id,
            rol=current_user.role,
        )

    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int,
    datos: CambioEstado,
    current_user: Usuario = Depends(require_role(["admin"])),
    pedido_service: PedidoService = Depends(get_pedido_service),
):
    """
    Cambia el estado de un pedido según la máquina de estados.
    Acceso exclusivo para administradores.
    """

    try:
        return pedido_service.cambiar_estado(
            pedido_id=pedido_id,
            nuevo_estado=datos.estado,
        )

    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    pedido_service: PedidoService = Depends(get_pedido_service),
):
    """
    Permite al cliente dueño cancelar su pedido en estado PENDIENTE.
    """

    try:
        return pedido_service.cancelar_pedido(
            pedido_id=pedido_id,
            usuario_id=current_user.id,
        )

    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )