interface EstadoVacioProps {
  title: string
  description: string
}

export function EstadoVacio({
  title,
  description,
}: EstadoVacioProps) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-slate-800">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        {description}
      </p>
    </section>
  )
}