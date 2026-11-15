from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario


router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)


def get_producto_service() -> ProductoService:
    """
    Construye el servicio de productos.
    """
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = Query(default=None),
    producto_service: ProductoService = Depends(get_producto_service),
):
    """
    Lista productos activos con paginación y filtros.
    Acceso público.
    """
    return producto_service.listar_productos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    producto_service: ProductoService = Depends(get_producto_service),
):
    """
    Obtiene el detalle de un producto activo.
    Acceso público.
    """
    try:
        return producto_service.obtener_producto(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    datos: ProductoCreate,
    current_user: Usuario = Depends(require_role(["admin"])),
    producto_service: ProductoService = Depends(get_producto_service),
):
    """
    Crea un producto asociado a una categoría activa.
    Acceso exclusivo para administradores.
    """
    try:
        return producto_service.crear_producto(datos)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    current_user: Usuario = Depends(require_role(["admin"])),
    producto_service: ProductoService = Depends(get_producto_service),
):
    """
    Actualiza los campos enviados de un producto.
    Acceso exclusivo para administradores.
    """
    try:
        return producto_service.actualizar_producto(
            producto_id,
            datos,
        )
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    current_user: Usuario = Depends(require_role(["admin"])),
    producto_service: ProductoService = Depends(get_producto_service),
):
    """
    Actualiza el stock y la disponibilidad de un producto.
    Acceso exclusivo para administradores.
    """
    try:
        return producto_service.actualizar_stock(
            producto_id,
            datos,
        )
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_producto(
    producto_id: int,
    current_user: Usuario = Depends(require_role(["admin"])),
    producto_service: ProductoService = Depends(get_producto_service),
):
    """
    Realiza la baja lógica de un producto.
    Acceso exclusivo para administradores.
    """
    try:
        producto_service.eliminar_producto(producto_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )