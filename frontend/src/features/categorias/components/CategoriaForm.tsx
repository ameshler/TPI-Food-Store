import { useForm } from '@tanstack/react-form'

export interface CategoriaFormValues {
  nombre: string
  descripcion: string
}

interface CategoriaFormProps {
  initialValues?: CategoriaFormValues
  submitting: boolean
  submitLabel: string
  onSubmit: (values: CategoriaFormValues) => Promise<void>
  onCancel: () => void
}

export function CategoriaForm({
  initialValues,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: CategoriaFormProps) {
  const form = useForm({
    defaultValues: initialValues ?? {
      nombre: '',
      descripcion: '',
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      })
    },
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onSubmit: ({ value }) => {
            const nombre = value.trim()

            if (nombre.length < 2) {
              return 'El nombre debe tener al menos 2 caracteres'
            }

            if (nombre.length > 100) {
              return 'El nombre no puede superar los 100 caracteres'
            }

            return undefined
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nombre
            </label>

            <input
              id={field.name}
              name={field.name}
              type="text"
              maxLength={100}
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <div className="mt-1 flex justify-between gap-2">
              <div>
                {field.state.meta.errors.map((message, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {String(message)}
                  </p>
                ))}
              </div>

              <span className="text-xs text-slate-400">
                {field.state.value.length}/100
              </span>
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Descripción (opcional)
            </label>

            <textarea
              id={field.name}
              name={field.name}
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(event.target.value)
              }
              placeholder="Descripción de la categoría..."
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={submitting || isSubmitting}
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting || isSubmitting}
              className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting || isSubmitting
                ? 'Guardando...'
                : submitLabel}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}