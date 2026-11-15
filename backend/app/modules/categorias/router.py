from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)


def get_categoria_service() -> CategoriaService:
    """
    Construye el servicio de categorías.
    """
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    categoria_service: CategoriaService = Depends(get_categoria_service),
):
    """
    Lista las categorías activas. Acceso público.
    """
    return categoria_service.listar_categorias()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    categoria_service: CategoriaService = Depends(get_categoria_service),
):
    """
    Obtiene el detalle de una categoría activa. Acceso público.
    """
    try:
        return categoria_service.obtener_categoria(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    datos: CategoriaCreate,
    current_user: Usuario = Depends(require_role(["admin"])),
    categoria_service: CategoriaService = Depends(get_categoria_service),
):
    """
    Crea una categoría. Acceso exclusivo para administradores.
    """
    try:
        return categoria_service.crear_categoria(datos)
    except NombreDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de la categoría ya está registrado",
        )


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    current_user: Usuario = Depends(require_role(["admin"])),
    categoria_service: CategoriaService = Depends(get_categoria_service),
):
    """
    Actualiza los campos enviados de una categoría.
    Acceso exclusivo para administradores.
    """
    try:
        return categoria_service.actualizar_categoria(
            categoria_id,
            datos,
        )
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    except NombreDuplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de la categoría ya está registrado",
        )


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    categoria_id: int,
    current_user: Usuario = Depends(require_role(["admin"])),
    categoria_service: CategoriaService = Depends(get_categoria_service),
):
    """
    Realiza la baja lógica de una categoría.
    Acceso exclusivo para administradores.
    """
    try:
        categoria_service.eliminar_categoria(categoria_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except CategoriaNoEncontrada:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )