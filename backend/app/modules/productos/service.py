from app.modules.categorias.schemas import CategoriaRead
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """El producto no existe o está dado de baja."""


class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está dada de baja."""


class ProductoService:

    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        """
        Lista productos activos con paginación y filtros.
        """
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            return ProductosPaginados(
                total=total,
                items=[
                    ProductoRead.model_validate(producto)
                    for producto in productos
                ],
            )

    def obtener_producto(self, producto_id: int) -> ProductoRead:
        """
        Obtiene el detalle de un producto activo.
        """
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()

            return ProductoRead.model_validate(producto)

    def crear_producto(
        self,
        datos: ProductoCreate,
    ) -> ProductoRead:
        """
        Crea un producto después de validar su categoría.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(datos.categoria_id)

            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()

            producto = Producto(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                precio_base=datos.precio_base,
                imagen_url=datos.imagen_url,
                stock=datos.stock,
                disponible=datos.disponible,
                categoria_id=datos.categoria_id,
                activo=True,
            )

            uow.productos.add(producto)

            assert uow.session is not None
            uow.session.flush()

            return ProductoRead.model_validate(producto)

    def actualizar_producto(
        self,
        producto_id: int,
        datos: ProductoUpdate,
    ) -> ProductoRead:
        """
        Actualiza únicamente los campos enviados.
        """
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()

            cambios = datos.model_dump(exclude_unset=True)

            # Si se cambia la categoría, verificamos que exista y esté activa.
            if "categoria_id" in cambios:
                categoria = uow.categorias.get_by_id(
                    cambios["categoria_id"]
                )

                if categoria is None or not categoria.activo:
                    raise CategoriaNoEncontrada()

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self,
        producto_id: int,
        datos: ProductoStockUpdate,
    ) -> ProductoRead:
        """
        Actualiza el stock y la disponibilidad de un producto.
        """
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()

            producto.stock = datos.stock
            producto.disponible = datos.disponible

            return ProductoRead.model_validate(producto)

    def eliminar_producto(self, producto_id: int) -> None:
        """
        Realiza una baja lógica del producto.
        """
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()

            producto.activo = False