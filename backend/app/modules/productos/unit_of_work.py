from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """
    Unit of Work para operaciones de productos.

    Expone los repositorios de productos y categorías
    utilizando una misma sesión de base de datos.
    """

    productos: ProductoRepository
    categorias: CategoriaRepository

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()

        assert self.session is not None

        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)

        return self