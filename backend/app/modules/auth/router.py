from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import UserCreate
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


def get_auth_service() -> AuthService:
    """
    Construye el servicio de autenticación.
    FastAPI lo inyecta mediante Depends.
    """
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Registra una cuenta pública con rol user.
    """
    return auth_service.registrar_usuario(user_data)


@router.post("/token")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Autentica al usuario y establece la cookie JWT HttpOnly.
    """
    access_token = auth_service.autenticar_usuario(
        username=form_data.username,
        password=form_data.password,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False,  # Desarrollo local HTTP; cambiar a True en producción HTTPS.
        samesite="lax",
        path="/",
    )

    return {"message": "Login exitoso"}


@router.post("/logout")
def logout(response: Response):
    """
    Elimina la cookie de autenticación.
    """
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
    )

    return {"message": "Logout exitoso"}


@router.get("/me", response_model=UserPublic)
def obtener_perfil(
    current_user: Usuario = Depends(get_current_active_user),
):
    """
    Devuelve el perfil del usuario autenticado.
    """
    return current_user