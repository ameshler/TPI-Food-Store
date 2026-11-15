interface EstadoErrorProps {
  message: string
  onRetry: () => void
}

export function EstadoError({
  message,
  onRetry,
}: EstadoErrorProps) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <h2 className="font-semibold text-red-800">
        No pudimos cargar la información
      </h2>

      <p className="mt-2 text-sm text-red-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        Reintentar
      </button>
    </section>
  )
}