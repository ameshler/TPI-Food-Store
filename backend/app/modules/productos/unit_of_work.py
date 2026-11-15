
from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """
    Unit of Work del módulo de pedidos.
    """

    productos: ProductoRepository

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()

        assert self.session is not None

        self.productos = ProductoRepository(self.session)

        return self
