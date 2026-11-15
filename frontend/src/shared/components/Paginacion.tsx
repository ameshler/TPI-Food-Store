interface PaginacionProps {
  paginaActual: number
  totalPaginas: number
  onCambiarPagina: (pagina: number) => void
  deshabilitada?: boolean
}

export function Paginacion({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
  deshabilitada = false,
}: PaginacionProps) {
  if (totalPaginas <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Paginación de productos"
      className="flex items-center justify-center gap-4"
    >
      <button
        type="button"
        disabled={paginaActual === 0 || deshabilitada}
        onClick={() => onCambiarPagina(paginaActual - 1)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      <span className="text-sm text-slate-600">
        Página {paginaActual + 1} de {totalPaginas}
      </span>

      <button
        type="button"
        disabled={
          paginaActual >= totalPaginas - 1 || deshabilitada
        }
        onClick={() => onCambiarPagina(paginaActual + 1)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </nav>
  )
}