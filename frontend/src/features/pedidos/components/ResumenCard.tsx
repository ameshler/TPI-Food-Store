interface ResumenCardProps {
  titulo: string
  valor: number | string
  descripcion: string
}

export function ResumenCard({
  titulo,
  valor,
  descripcion,
}: ResumenCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {valor}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {descripcion}
      </p>
    </article>
  )
}