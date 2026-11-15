from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios"],
)


def get_usuario_service() -> UsuarioService:
    """
    Construye el servicio de gestión de usuarios.
    """
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    current_user: Usuario = Depends(require_role(["admin"])),
    usuario_service: UsuarioService = Depends(get_usuario_service),
):
    """
    Lista todos los usuarios. Acceso exclusivo para administradores.
    """
    return usuario_service.listar_usuarios()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    current_user: Usuario = Depends(require_role(["admin"])),
    usuario_service: UsuarioService = Depends(get_usuario_service),
):
    """
    Activa una cuenta de usuario.
    """
    return usuario_service.activar_usuario(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    current_user: Usuario = Depends(require_role(["admin"])),
    usuario_service: UsuarioService = Depends(get_usuario_service),
):
    """
    Desactiva una cuenta de usuario.
    """
    return usuario_service.desactivar_usuario(
        usuario_id=usuario_id,
        usuario_actual=current_user,
    )