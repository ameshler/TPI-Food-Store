from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está dada de baja."""


class NombreDuplicado(Exception):
    """El nombre de categoría ya está registrado."""


class CategoriaService:

    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_categorias(self) -> list[CategoriaRead]:
        """
        Devuelve solamente las categorías activas.
        """
        with self.uow as uow:
            categorias = uow.categorias.get_all_active()

            return [
                CategoriaRead.model_validate(categoria)
                for categoria in categorias
            ]

    def obtener_categoria(self, categoria_id: int) -> CategoriaRead:
        """
        Obtiene una categoría activa por su identificador.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            return CategoriaRead.model_validate(categoria)

    def crear_categoria(
        self,
        datos: CategoriaCreate,
    ) -> CategoriaRead:
        """
        Crea una categoría verificando que su nombre sea único.
        """
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(datos.nombre)

            if existente is not None:
                raise NombreDuplicado()

            categoria = Categoria(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                activo=True,
            )

            uow.categorias.add(categoria)

            assert uow.session is not None
            uow.session.flush()

            return CategoriaRead.model_validate(categoria)

    def actualizar_categoria(
        self,
        categoria_id: int,
        datos: CategoriaUpdate,
    ) -> CategoriaRead:
        """
        Actualiza solamente los campos enviados.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            cambios = datos.model_dump(exclude_unset=True)

            nuevo_nombre = cambios.get("nombre")

            if (
                nuevo_nombre is not None
                and nuevo_nombre != categoria.nombre
            ):
                existente = uow.categorias.get_by_nombre(nuevo_nombre)

                if existente is not None:
                    raise NombreDuplicado()

            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)

            return CategoriaRead.model_validate(categoria)

    def eliminar_categoria(self, categoria_id: int) -> None:
        """
        Realiza una baja lógica de la categoría.
        No elimina físicamente el registro ni sus productos.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            categoria.activo = False